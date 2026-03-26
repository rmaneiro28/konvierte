export const formatCurrency = (value: number | string, decimals = 2) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
    if (isNaN(num)) return '0,00';
    return new Intl.NumberFormat('es-VE', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
    }).format(num);
};
