import { Document, Types } from 'mongoose';

/**
 * Safely get the string ID from a Mongoose document
 * This handles the TypeScript unknown type issue
 */
export function getDocumentId(doc: Document): string {
  // Using type assertion to handle the unknown type
  return (doc._id as Types.ObjectId).toString();
}

/**
 * Safely convert a Mongoose document to a plain object with ID
 */
export function documentToObject<T extends Document>(doc: T): any {
  const obj = doc.toObject();
  return {
    ...obj,
    id: getDocumentId(doc)
  };
}

/**
 * Safely get specific fields from a Mongoose document
 * This is useful when you don't want to return the entire document
 */
export function extractDocumentFields<T extends Document>(
  doc: T, 
  fields: string[]
): Record<string, any> {
  const obj = doc.toObject();
  const result: Record<string, any> = {
    id: getDocumentId(doc)
  };
  
  for (const field of fields) {
    if (field in obj) {
      result[field] = obj[field];
    }
  }
  
  return result;
} 