import { openDB } from 'idb';
import L from 'leaflet';

class OfflineMapService {
  constructor() {
    this.dbName = 'mylibaas-maps';
    this.version = 1;
    this.tileSize = 256;
    this.initializeDb();
  }

  async initializeDb() {
    this.db = await openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tiles')) {
          db.createObjectStore('tiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('areas')) {
          db.createObjectStore('areas', { keyPath: 'id' });
        }
      },
    });
  }

  async downloadAreaTiles(bounds, minZoom, maxZoom) {
    const tiles = [];
    
    for (let z = minZoom; z <= maxZoom; z++) {
      const northEastTile = this.latLngToTile(bounds.getNorthEast(), z);
      const southWestTile = this.latLngToTile(bounds.getSouthWest(), z);

      for (let x = southWestTile.x; x <= northEastTile.x; x++) {
        for (let y = northEastTile.y; y <= southWestTile.y; y++) {
          tiles.push({
            x,
            y,
            z,
            id: `${z}/${x}/${y}`,
          });
        }
      }
    }

    const total = tiles.length;
    let downloaded = 0;

    for (const tile of tiles) {
      try {
        const url = this.getTileUrl(tile.x, tile.y, tile.z);
        const response = await fetch(url);
        const blob = await response.blob();

        await this.db.put('tiles', {
          id: tile.id,
          blob,
          timestamp: new Date(),
        });

        downloaded++;
        this.onProgress?.(downloaded, total);
      } catch (error) {
        console.error(`Error downloading tile ${tile.id}:`, error);
      }
    }

    // Save the area
    await this.db.put('areas', {
      id: Date.now().toString(),
      bounds,
      minZoom,
      maxZoom,
      timestamp: new Date(),
      tileCount: total,
    });

    return {
      downloaded,
      total,
      size: await this.getStorageSize(),
    };
  }

  async getTile(x, y, z) {
    const id = `${z}/${x}/${y}`;
    try {
      const tile = await this.db.get('tiles', id);
      return tile?.blob;
    } catch (error) {
      console.error(`Error getting tile ${id}:`, error);
      return null;
    }
  }

  async clearOldTiles(daysToKeep = 30) {
    try {
      const tx = this.db.transaction('tiles', 'readwrite');
      const store = tx.objectStore('tiles');
      const tiles = await store.getAll();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const tile of tiles) {
        if (new Date(tile.timestamp) < cutoffDate) {
          await store.delete(tile.id);
        }
      }
    } catch (error) {
      console.error('Error clearing old tiles:', error);
    }
  }

  async getStorageSize() {
    const tiles = await this.db.getAll('tiles');
    return tiles.reduce((total, tile) => total + tile.blob.size, 0);
  }

  async getDownloadedAreas() {
    return this.db.getAll('areas');
  }

  async deleteArea(areaId) {
    const area = await this.db.get('areas', areaId);
    if (!area) return;

    // Delete all tiles in the area
    const tiles = await this.getTilesInBounds(area.bounds, area.minZoom, area.maxZoom);
    const tx = this.db.transaction(['tiles', 'areas'], 'readwrite');

    for (const tile of tiles) {
      await tx.objectStore('tiles').delete(tile.id);
    }

    await tx.objectStore('areas').delete(areaId);
  }

  createOfflineLayer() {
    return L.tileLayer('', {
      minZoom: 0,
      maxZoom: 19,
      tileSize: this.tileSize,
      getTileUrl: async (coords) => {
        const tile = await this.getTile(coords.x, coords.y, coords.z);
        if (tile) {
          return URL.createObjectURL(tile);
        }
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      },
    });
  }

  latLngToTile(latLng, zoom) {
    const lat = latLng.lat;
    const lng = latLng.lng;
    const n = Math.pow(2, zoom);
    const x = Math.floor((lng + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x, y };
  }

  getTileUrl(x, y, z) {
    // Using OpenStreetMap tiles as an example
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  }

  setProgressCallback(callback) {
    this.onProgress = callback;
  }
}

export default new OfflineMapService();
