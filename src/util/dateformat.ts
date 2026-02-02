
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