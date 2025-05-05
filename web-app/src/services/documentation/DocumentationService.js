import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { marked } from 'marked';
import yaml from 'js-yaml';

class DocumentationService {
  static DOC_TYPES = {
    API: 'api',
    USER: 'user',
    ADMIN: 'admin',
    DEVELOPER: 'developer',
    ARCHITECTURE: 'architecture'
  };

  static DOC_STATUS = {
    DRAFT: 'draft',
    REVIEW: 'review',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  };

  static async initialize() {
    try {
      // Initialize documentation system
      await Promise.all([
        this.initializeAPIDocumentation(),
        this.initializeUserGuides(),
        this.initializeAdminGuides(),
        this.initializeDeveloperDocs(),
        this.initializeArchitectureDocs()
      ]);

      return { success: true, message: 'Documentation service initialized' };
    } catch (error) {
      console.error('Error initializing documentation service:', error);
      throw error;
    }
  }

  static async generateAPIDocumentation() {
    try {
      const apiDocs = {
        openapi: '3.0.0',
        info: {
          title: 'MyLibaas API Documentation',
          version: '1.0.0',
          description: 'API documentation for the MyLibaas clothing rental platform'
        },
        servers: [
          {
            url: 'https://api.mylibaas.com/v1',
            description: 'Production server'
          },
          {
            url: 'https://staging-api.mylibaas.com/v1',
            description: 'Staging server'
          }
        ],
        paths: await this.generateAPIPaths(),
        components: await this.generateAPIComponents()
      };

      // Convert to YAML
      const yamlDocs = yaml.dump(apiDocs);

      // Store documentation
      await this.storeDocumentation('api', yamlDocs);

      return apiDocs;
    } catch (error) {
      console.error('Error generating API documentation:', error);
      throw error;
    }
  }

  static async generateUserGuides() {
    try {
      const guides = [
        await this.generateGettingStartedGuide(),
        await this.generateRentalGuide(),
        await this.generatePaymentGuide(),
        await this.generateProfileGuide()
      ];

      // Convert to markdown
      const markdownDocs = guides.map(guide => this.convertToMarkdown(guide));

      // Store documentation
      await Promise.all(
        guides.map((guide, index) =>
          this.storeDocumentation('user', markdownDocs[index], guide.title)
        )
      );

      return guides;
    } catch (error) {
      console.error('Error generating user guides:', error);
      throw error;
    }
  }

  static async generateArchitectureDocs() {
    try {
      const docs = [
        await this.generateSystemOverview(),
        await this.generateSecurityArchitecture(),
        await this.generateDatabaseArchitecture(),
        await this.generateInfrastructureArchitecture()
      ];

      // Convert to markdown
      const markdownDocs = docs.map(doc => this.convertToMarkdown(doc));

      // Store documentation
      await Promise.all(
        docs.map((doc, index) =>
          this.storeDocumentation('architecture', markdownDocs[index], doc.title)
        )
      );

      return docs;
    } catch (error) {
      console.error('Error generating architecture docs:', error);
      throw error;
    }
  }

  // Documentation Generation Helpers
  static async generateAPIPaths() {
    return {
      '/auth': {
        post: {
          summary: 'Authenticate user',
          description: 'Authenticate a user and return a JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Successful authentication',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse'
                  }
                }
              }
            }
          }
        }
      },
      '/items': {
        get: {
          summary: 'List items',
          description: 'Get a list of rental items',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer' }
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page',
              schema: { type: 'integer' }
            }
          ],
          responses: {
            '200': {
              description: 'List of items',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Item'
                    }
                  }
                }
              }
            }
          }
        }
      }
      // Add more paths...
    };
  }

  static async generateAPIComponents() {
    return {
      schemas: {
        AuthRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          },
          required: ['email', 'password']
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' }
          }
        }
        // Add more schemas...
      }
    };
  }

  static async generateGettingStartedGuide() {
    return {
      title: 'Getting Started with MyLibaas',
      content: [
        {
          section: 'Introduction',
          content: 'Welcome to MyLibaas, your premium clothing rental platform...'
        },
        {
          section: 'Creating an Account',
          content: 'Follow these steps to create your MyLibaas account...'
        },
        {
          section: 'Browsing Items',
          content: 'Learn how to browse and filter our extensive collection...'
        }
      ]
    };
  }

  static async generateSystemOverview() {
    return {
      title: 'System Architecture Overview',
      content: [
        {
          section: 'System Components',
          content: 'MyLibaas is built using a microservices architecture...'
        },
        {
          section: 'Data Flow',
          content: 'Data flows through the system in the following way...'
        },
        {
          section: 'Integration Points',
          content: 'The system integrates with the following external services...'
        }
      ]
    };
  }

  // Utility Methods
  static convertToMarkdown(doc) {
    let markdown = `# ${doc.title}\n\n`;

    doc.content.forEach(section => {
      markdown += `## ${section.section}\n\n${section.content}\n\n`;
    });

    return markdown;
  }

  static async storeDocumentation(type, content, title = '') {
    try {
      const docId = title ? 
        `${type}_${title.toLowerCase().replace(/\s+/g, '_')}` :
        `${type}_${Date.now()}`;

      await setDoc(doc(db, 'documentation', docId), {
        type,
        title,
        content,
        status: this.DOC_STATUS.PUBLISHED,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing documentation:', error);
      throw error;
    }
  }

  static async publishDocumentation(type, id) {
    try {
      const docRef = doc(db, 'documentation', id);
      await setDoc(docRef, {
        status: this.DOC_STATUS.PUBLISHED,
        publishedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error publishing documentation:', error);
      throw error;
    }
  }

  static async archiveDocumentation(type, id) {
    try {
      const docRef = doc(db, 'documentation', id);
      await setDoc(docRef, {
        status: this.DOC_STATUS.ARCHIVED,
        archivedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error archiving documentation:', error);
      throw error;
    }
  }
}

export default DocumentationService;
