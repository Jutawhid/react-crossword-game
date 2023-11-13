export function getSum(array) {
    return array.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
}