import Papa from 'papaparse';
import prisma from '../utils/db';

export const importCsvData = async (
  csvContent: string, 
  entityName: string, 
  configId: string, 
  userId: string
) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<any>) => {
        try {
          const records = results.data.map((item: any) => ({
            entityName,
            data: JSON.stringify(item), // STRINGIFY FOR SQLITE
            configId,
            userId
          }));

          const count = await prisma.dynamicEntity.createMany({
            data: records
          });

          resolve(count);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
};
