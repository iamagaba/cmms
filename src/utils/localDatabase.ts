import Dexie, { Table } from 'dexie';
import { WorkOrder } from '@/types/supabase';

// Define the schema for our local database
class LocalDatabase extends Dexie {
  workOrders: Table<WorkOrder, string>;

  constructor() {
    super('CMMSLocalDB');
    this.version(1).stores({
      workOrders: 'id, workOrderNumber, status, createdAt, updatedAt'
    });
    this.workOrders = this.table('workOrders');
  }
}

// Create a singleton instance of the database
const db = new LocalDatabase();

export default db;