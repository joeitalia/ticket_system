
export const formatDate = (dateStr: string, hasTime: boolean=false) => {
  const date = new Date(dateStr)
  if (hasTime) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } else {
    return date.toLocaleDateString('en-US')
  }
}

export const formatDateInput = (dateStr: string) => {
  const [month, day, year] = dateStr.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return formattedDate;
}

export const formatDateDisplay = (dateStr: string) => {
  const today = new Date(dateStr);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}