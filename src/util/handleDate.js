
const getDay=(date)=>{
    const dateParts = date.split('-');
    date= new Date(`${dateParts[0]}-${dateParts[1]}-${parseInt( dateParts[2])+1}`)
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset())
    return date
  }
  const getMonthNext=(date)=>{
    const dateParts = date.split('-');
    date= new Date (`${dateParts[0]}-${parseInt(dateParts[1])+1}-1`)
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset())
    return date
  }
  const getMonthCur=(date)=>{
    const dateParts = date.split('-');
    date= new Date (`${dateParts[0]}-${dateParts[1]}-1`)
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset())
    return date
  }
  const getYearCur=(date)=>{
    const dateParts = date.split('-');
    date= new Date (`${dateParts[0]}-1-1`)
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset())
    return date
  }
  const getYearNext=(date)=>{
    const dateParts = date.split('-');
    date= new Date (`${parseInt(dateParts[0])+1}-1-1`)
    date.setMinutes(date.getMinutes()+date.getTimezoneOffset())
    return date
  }

  module.exports={
      getDay,getMonthCur,getMonthNext,getYearCur, getYearNext
  }