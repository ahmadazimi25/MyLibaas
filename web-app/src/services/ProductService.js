import { db } from './firebase/firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { storage } from './firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class ProductService {
  static COLLECTION = 'products';
  static ITEMS_PER_PAGE = 12;

  static async createProduct(productData, images) {
    try {
      // Upload images first
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );

      // Create product document
      const product = {
        ...productData,
        images: imageUrls,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), product);
      return { id: docRef.id, ...product };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async getProduct(productId) {
    try {
      const docRef = doc(db, this.COLLECTION, productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  static async searchProducts({ 
    searchQuery = '', 
    filters = {}, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    lastDoc = null,
    itemsPerPage = this.ITEMS_PER_PAGE 
  }) {
    try {
      let q = collection(db, this.COLLECTION);
      const conditions = [];

      // Add search query condition
      if (searchQuery) {
        conditions.push(where('keywords', 'array-contains', searchQuery.toLowerCase()));
      }

      // Add filter conditions
      if (filters.category) {
        conditions.push(where('category', '==', filters.category));
      }
      if (filters.culture) {
        conditions.push(where('culture', '==', filters.culture));
      }
      if (filters.minPrice) {
        conditions.push(where('pricePerDay', '>=', filters.minPrice));
      }
      if (filters.maxPrice) {
        conditions.push(where('pricePerDay', '<=', filters.maxPrice));
      }
      if (filters.size) {
        conditions.push(where('size', '==', filters.size));
      }
      if (filters.availability) {
        conditions.push(where('availability', '==', filters.availability));
      }

      // Build query with conditions
      q = query(q, ...conditions, orderBy(sortBy, sortOrder));

      // Add pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(itemsPerPage));

      // Execute query
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      // Get the last document for pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        products,
        lastDoc: lastVisible,
        hasMore: products.length === itemsPerPage
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  static async getFeaturedProducts(count = 4) {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );

      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  static async updateProduct(productId, updateData, newImages = []) {
    try {
      const docRef = doc(db, this.COLLECTION, productId);
      
      // Upload new images if any
      if (newImages.length > 0) {
        const newImageUrls = await Promise.all(
          newImages.map(async (image) => {
            const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          })
        );
        updateData.images = [...(updateData.images || []), ...newImageUrls];
      }

      updateData.updatedAt = Timestamp.now();
      await updateDoc(docRef, updateData);

      return { id: productId, ...updateData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      const docRef = doc(db, this.COLLECTION, productId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async getProductsByUser(userId) {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });

      return products;
    } catch (error) {
      console.error('Error getting user products:', error);
      throw error;
    }
  }
}

export default ProductService;
