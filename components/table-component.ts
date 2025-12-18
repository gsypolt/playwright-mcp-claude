import { Page, Locator } from '@playwright/test';

/**
 * Reusable table component for handling table interactions
 */
export class TableComponent {
  constructor(
    private page: Page,
    private tableSelector: string = 'table'
  ) {}

  /**
   * Get table element
   */
  getTable(): Locator {
    return this.page.locator(this.tableSelector);
  }

  /**
   * Get all rows
   */
  async getRows(): Promise<Locator[]> {
    return await this.getTable().locator('tbody tr').all();
  }

  /**
   * Get row by index
   */
  getRow(index: number): Locator {
    return this.getTable().locator('tbody tr').nth(index);
  }

  /**
   * Get row count
   */
  async getRowCount(): Promise<number> {
    return await this.getTable().locator('tbody tr').count();
  }

  /**
   * Get headers
   */
  async getHeaders(): Promise<string[]> {
    return await this.getTable().locator('thead th').allTextContents();
  }

  /**
   * Get cell by row and column index
   */
  getCell(rowIndex: number, columnIndex: number): Locator {
    return this.getRow(rowIndex).locator('td').nth(columnIndex);
  }

  /**
   * Get cell value by row and column index
   */
  async getCellValue(rowIndex: number, columnIndex: number): Promise<string | null> {
    return await this.getCell(rowIndex, columnIndex).textContent();
  }

  /**
   * Get row by cell value
   */
  async getRowByCellValue(columnIndex: number, value: string): Promise<Locator | null> {
    const rows = await this.getRows();
    for (const row of rows) {
      const cellValue = await row.locator('td').nth(columnIndex).textContent();
      if (cellValue?.trim() === value.trim()) {
        return row;
      }
    }
    return null;
  }

  /**
   * Click on row by index
   */
  async clickRow(index: number) {
    await this.getRow(index).click();
  }

  /**
   * Click on cell
   */
  async clickCell(rowIndex: number, columnIndex: number) {
    await this.getCell(rowIndex, columnIndex).click();
  }

  /**
   * Sort by column
   */
  async sortByColumn(columnIndex: number) {
    await this.getTable().locator('thead th').nth(columnIndex).click();
  }

  /**
   * Search/filter table
   */
  async search(query: string) {
    const searchInput = this.page.locator('input[type="search"], input[placeholder*="Search"]');
    await searchInput.fill(query);
  }

  /**
   * Get all data from table
   */
  async getAllData(): Promise<Array<Record<string, string>>> {
    const headers = await this.getHeaders();
    const rows = await this.getRows();
    const data: Array<Record<string, string>> = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header] = cells[index]?.trim() || '';
      });
      data.push(rowData);
    }

    return data;
  }

  /**
   * Select row checkbox
   */
  async selectRow(index: number) {
    await this.getRow(index).locator('input[type="checkbox"]').check();
  }

  /**
   * Select all rows
   */
  async selectAllRows() {
    await this.getTable().locator('thead input[type="checkbox"]').check();
  }

  /**
   * Get selected rows count
   */
  async getSelectedRowsCount(): Promise<number> {
    return await this.getTable().locator('tbody input[type="checkbox"]:checked').count();
  }
}
