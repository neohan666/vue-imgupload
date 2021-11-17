/** 
 * @Description: 一些工具示例
 * @Author: Neo
 * @Date: 2021-07-30
 * @LastEditTime: 2021-11-17
 * @LastEditors: Neo
 */
/**
 * 创建唯一的字符串
 * @return {string} ojgdvbvaua40
 */
function createUniqueString (): string {
  const timestamp = +new Date() + ''
  const randomNum = (1 + Math.random()) * 65536 + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * 数字存储大小格式化
 * @param {number} num 存储大小 单位：Byte
 * @param {number} digits 保留几位小数，默认2
 * @return {string} 2MB
 */
function formatStorage (num: number, digits?: number) {
  digits = digits || 2
  if (num < 1024) {
    return num + 'B'
  }
  num = (num * 1000 / 1024)
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'K' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') +
        si[i].symbol + 'B'
    }
  }
}

export default {
  createUniqueString,
  formatStorage,
}