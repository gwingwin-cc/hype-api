interface ComponentTemplate {
  name: string;
  type: 'INPUT' | 'DECORATOR';
  slug: string;
  columnType: string;
}

interface AllowColumnType {
  name: string;
  slug: string;
  columnType: string;
}

export const AllowColumnTypes: Array<AllowColumnType> = [
  {
    name: 'VARCHAR(30)',
    slug: 'varchar-30',
    columnType: 'VARCHAR(30)',
  },
  {
    name: 'VARCHAR(100)',
    slug: 'varchar-100',
    columnType: 'VARCHAR(100)',
  },
  {
    name: 'VARCHAR(255)',
    slug: 'varchar-255',
    columnType: 'VARCHAR(255)',
  },
  {
    name: 'FLOAT',
    slug: 'float',
    columnType: 'FLOAT',
  },
  {
    name: 'INT',
    slug: 'int',
    columnType: 'INT',
  },
  {
    name: 'TINYTEXT',
    slug: 'tinytext',
    columnType: 'TINYTEXT',
  },
  {
    name: 'MEDIUMTEXT',
    slug: 'mediumtext',
    columnType: 'MEDIUMTEXT',
  },
  {
    name: 'SMALLINT',
    slug: 'smallint',
    columnType: 'SMALLINT',
  },
  {
    name: 'TIME',
    slug: 'time',
    columnType: 'TIME',
  },
  {
    name: 'DATE',
    slug: 'date',
    columnType: 'DATE',
  },
  {
    name: 'DATETIME',
    slug: 'datetime',
    columnType: 'DATETIME',
  },
  {
    name: 'BOOLEAN',
    slug: 'boolean',
    columnType: 'BOOLEAN',
  },
  {
    name: 'JSON',
    slug: 'json',
    columnType: 'JSON',
  },
];

export const ComponentTemplates: Array<ComponentTemplate> = [
  {
    name: 'Text Input',
    slug: 'text-input',
    type: 'INPUT',
    columnType: 'VARCHAR(100)',
  },
  {
    name: 'Number Input',
    slug: 'number-input',
    type: 'INPUT',
    columnType: 'INT',
  },
  {
    name: 'Float Input',
    slug: 'float-input',
    type: 'INPUT',
    columnType: 'FLOAT',
  },
  {
    name: 'Mask Input',
    slug: 'mask-input',
    type: 'INPUT',
    columnType: 'VARCHAR(100)',
  },
  {
    name: 'Text Area',
    slug: 'text-area-tiny',
    type: 'INPUT',
    columnType: 'TINYTEXT',
  },
  {
    name: 'Text Area',
    slug: 'text-area-medium',
    type: 'INPUT',
    columnType: 'MEDIUMTEXT',
  },
  {
    name: 'Radio Input',
    slug: 'radio',
    type: 'INPUT',
    columnType: 'SMALLINT',
  },
  {
    name: 'Radio Input ',
    slug: 'radio-varchar-30',
    type: 'INPUT',
    columnType: 'VARCHAR(30)',
  },
  {
    name: 'Selects',
    slug: 'select',
    type: 'INPUT',
    columnType: 'INT',
  },
  {
    name: 'Selects(Reference)',
    slug: 'relation',
    type: 'INPUT',
    columnType: 'INT',
  },
  {
    name: 'Date Picker',
    slug: 'date',
    type: 'INPUT',
    columnType: 'DATE',
  },
  {
    name: 'Time Picker',
    slug: 'time',
    type: 'INPUT',
    columnType: 'TIME',
  },
  {
    name: 'Date & Time Picker',
    slug: 'datetime',
    type: 'INPUT',
    columnType: 'DATETIME',
  },
  {
    name: 'Checkbox',
    slug: 'checkbox',
    type: 'INPUT',
    columnType: 'BOOLEAN',
  },
  {
    name: 'Editor',
    slug: 'editor',
    type: 'INPUT',
    columnType: 'MEDIUMTEXT',
  },
  {
    name: 'Editor',
    slug: 'editor-tiny',
    type: 'INPUT',
    columnType: 'TINYTEXT',
  },
  {
    name: 'File Upload',
    slug: 'file-input',
    type: 'INPUT',
    columnType: 'VARCHAR(255)',
  },
  {
    name: 'Selects(Reference)',
    slug: 'relation',
    type: 'INPUT',
    columnType: 'INT',
  },
  {
    name: 'DataTable(Reference)',
    slug: 'relation-multiple',
    type: 'INPUT',
    columnType: 'INT',
  },
];
