import { toPng } from 'html-to-image';
import { toast } from 'sonner';

/**
 * Exports a DOM element as a PNG image
 * @param {string} elementId - The ID of the element to export
 * @param {string} fileName - The name of the resulting file
 */
export async function exportElementAsPng(elementId, fileName = 'export.png') {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error('Element not found for export');
        return;
    }

    const toastId = toast.loading(`Preparing ${fileName}...`);

    try {
        const dataUrl = await toPng(element, { 
            backgroundColor: 'transparent',
            style: {
                // Ensure text is visible in captured image
                color: 'currentColor'
            }
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        
        toast.success(`Exported ${fileName}`, { id: toastId });
    } catch (error) {
        console.error('Export failed:', error);
        toast.error('Failed to export image', { id: toastId });
    }
}

/**
 * Downloads data as a CSV file
 */
export function exportToCsv(data, fileName = 'data.csv') {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Downloaded ${fileName}`);
}

/**
 * Downloads data as a JSON file
 */
export function exportToJson(data, fileName = 'data.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    
    toast.success(`Downloaded ${fileName}`);
}
