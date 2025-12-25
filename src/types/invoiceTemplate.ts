// Invoice template types for common EV motorbike services

export interface InvoiceTemplateItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  category: 'labor' | 'parts' | 'diagnostic' | 'service';
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'battery' | 'motor' | 'electrical' | 'diagnostic' | 'maintenance' | 'custom';
  items: InvoiceTemplateItem[];
  estimated_total: number;
  estimated_duration_hours: number;
  notes?: string;
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'battery-replacement',
    name: 'Battery Pack Replacement',
    description: 'Complete battery pack replacement service',
    category: 'battery',
    estimated_duration_hours: 3,
    items: [
      {
        description: 'Battery Pack Removal and Installation',
        quantity: 1,
        unit_price: 150000,
        tax_rate: 18,
        category: 'labor'
      },
      {
        description: 'New Lithium-Ion Battery Pack (48V 20Ah)',
        quantity: 1,
        unit_price: 2500000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Battery Management System Check',
        quantity: 1,
        unit_price: 50000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Electrical Connection Testing',
        quantity: 1,
        unit_price: 30000,
        tax_rate: 18,
        category: 'service'
      }
    ],
    estimated_total: 3201400,
    notes: 'Includes 6-month warranty on battery pack. Old battery disposal included.'
  },
  {
    id: 'motor-repair',
    name: 'Motor System Repair',
    description: 'Electric motor diagnostics and repair',
    category: 'motor',
    estimated_duration_hours: 4,
    items: [
      {
        description: 'Motor Diagnostics and Testing',
        quantity: 1,
        unit_price: 80000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Motor Disassembly and Inspection',
        quantity: 1,
        unit_price: 120000,
        tax_rate: 18,
        category: 'labor'
      },
      {
        description: 'Bearing Replacement',
        quantity: 2,
        unit_price: 45000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Motor Winding Repair',
        quantity: 1,
        unit_price: 350000,
        tax_rate: 18,
        category: 'labor'
      },
      {
        description: 'Motor Reassembly and Testing',
        quantity: 1,
        unit_price: 100000,
        tax_rate: 18,
        category: 'labor'
      }
    ],
    estimated_total: 826100,
    notes: '3-month warranty on motor repair. Performance testing included.'
  },
  {
    id: 'charging-system',
    name: 'Charging System Service',
    description: 'Complete charging system inspection and repair',
    category: 'electrical',
    estimated_duration_hours: 2,
    items: [
      {
        description: 'Charging Port Inspection',
        quantity: 1,
        unit_price: 40000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Charger Testing and Calibration',
        quantity: 1,
        unit_price: 60000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Charging Cable Replacement',
        quantity: 1,
        unit_price: 85000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Charging Port Connector Repair',
        quantity: 1,
        unit_price: 55000,
        tax_rate: 18,
        category: 'labor'
      }
    ],
    estimated_total: 283200,
    notes: 'Includes charging efficiency test and safety inspection.'
  },
  {
    id: 'brake-system',
    name: 'Brake System Service',
    description: 'Complete brake inspection and service',
    category: 'maintenance',
    estimated_duration_hours: 1.5,
    items: [
      {
        description: 'Brake System Inspection',
        quantity: 1,
        unit_price: 30000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Brake Pad Replacement (Front)',
        quantity: 1,
        unit_price: 65000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Brake Pad Replacement (Rear)',
        quantity: 1,
        unit_price: 65000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Brake Fluid Replacement',
        quantity: 1,
        unit_price: 25000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Brake Adjustment and Testing',
        quantity: 1,
        unit_price: 35000,
        tax_rate: 18,
        category: 'labor'
      }
    ],
    estimated_total: 259700,
    notes: 'Includes brake performance test and safety certification.'
  },
  {
    id: 'full-diagnostic',
    name: 'Complete Diagnostic Scan',
    description: 'Comprehensive electrical and mechanical diagnostics',
    category: 'diagnostic',
    estimated_duration_hours: 2,
    items: [
      {
        description: 'Battery Health Diagnostic',
        quantity: 1,
        unit_price: 50000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Motor Performance Testing',
        quantity: 1,
        unit_price: 60000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Controller System Scan',
        quantity: 1,
        unit_price: 70000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Electrical System Check',
        quantity: 1,
        unit_price: 45000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Diagnostic Report Generation',
        quantity: 1,
        unit_price: 25000,
        tax_rate: 18,
        category: 'service'
      }
    ],
    estimated_total: 295000,
    notes: 'Includes detailed diagnostic report with recommendations.'
  },
  {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance Package',
    description: 'Regular maintenance service for optimal performance',
    category: 'maintenance',
    estimated_duration_hours: 2.5,
    items: [
      {
        description: 'General Inspection',
        quantity: 1,
        unit_price: 40000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'Battery Connection Cleaning',
        quantity: 1,
        unit_price: 30000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Tire Pressure Check and Adjustment',
        quantity: 1,
        unit_price: 15000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Chain Lubrication',
        quantity: 1,
        unit_price: 20000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Electrical Connection Inspection',
        quantity: 1,
        unit_price: 35000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'Software Update (if available)',
        quantity: 1,
        unit_price: 50000,
        tax_rate: 18,
        category: 'service'
      }
    ],
    estimated_total: 224400,
    notes: 'Recommended every 3 months or 1,000 km. Includes performance report.'
  },
  {
    id: 'controller-replacement',
    name: 'Controller Replacement',
    description: 'Motor controller replacement and programming',
    category: 'electrical',
    estimated_duration_hours: 3,
    items: [
      {
        description: 'Controller Diagnostics',
        quantity: 1,
        unit_price: 60000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'New Motor Controller Unit',
        quantity: 1,
        unit_price: 850000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Controller Installation',
        quantity: 1,
        unit_price: 120000,
        tax_rate: 18,
        category: 'labor'
      },
      {
        description: 'Controller Programming and Calibration',
        quantity: 1,
        unit_price: 80000,
        tax_rate: 18,
        category: 'service'
      },
      {
        description: 'System Integration Testing',
        quantity: 1,
        unit_price: 50000,
        tax_rate: 18,
        category: 'diagnostic'
      }
    ],
    estimated_total: 1298000,
    notes: 'Includes controller programming and 6-month warranty.'
  },
  {
    id: 'display-repair',
    name: 'Display Panel Repair',
    description: 'Dashboard display repair or replacement',
    category: 'electrical',
    estimated_duration_hours: 1.5,
    items: [
      {
        description: 'Display Diagnostics',
        quantity: 1,
        unit_price: 35000,
        tax_rate: 18,
        category: 'diagnostic'
      },
      {
        description: 'LCD Display Panel',
        quantity: 1,
        unit_price: 180000,
        tax_rate: 18,
        category: 'parts'
      },
      {
        description: 'Display Installation',
        quantity: 1,
        unit_price: 45000,
        tax_rate: 18,
        category: 'labor'
      },
      {
        description: 'Display Calibration',
        quantity: 1,
        unit_price: 25000,
        tax_rate: 18,
        category: 'service'
      }
    ],
    estimated_total: 336700,
    notes: 'Includes display calibration and waterproofing check.'
  }
];

// Helper function to calculate template total
export const calculateTemplateTotal = (items: InvoiceTemplateItem[]): number => {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.unit_price;
    const taxAmount = itemTotal * (item.tax_rate / 100);
    return total + itemTotal + taxAmount;
  }, 0);
};

// Helper function to get template by ID
export const getTemplateById = (id: string): InvoiceTemplate | undefined => {
  return INVOICE_TEMPLATES.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (category: InvoiceTemplate['category']): InvoiceTemplate[] => {
  return INVOICE_TEMPLATES.filter(template => template.category === category);
};
