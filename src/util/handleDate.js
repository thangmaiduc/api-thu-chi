
const getDay=(date)=>{
    const dateParts = date.split('-');
    return `${dateParts[0]}-${dateParts[1]}-${parseInt( dateParts[2])+1}`
  }
  const getMonthNext=(date)=>{
    const dateParts = date.split('-');
    return `${dateParts[0]}-${parseInt(dateParts[1])+1}-1`
  }
  const getMonthCur=(date)=>{
    const dateParts = date.split('-');
    return `${dateParts[0]}-${dateParts[1]}-1`
  }
  const getYearCur=(date)=>{
    const dateParts = date.split('-');
    return `${dateParts[0]}-1-1`
  }
  const getYearNext=(date)=>{
    const dateParts = date.split('-');
    return `${parseInt(dateParts[0])+1}-1-1`
  }

  module.exports={
      getDay,getMonthCur,getMonthNext,getYearCur, getYearNext
  }