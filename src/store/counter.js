/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:23:55
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-03 12:11:42
 * @Description: 
 */
import { observable } from 'mobx'

const dataStore = observable({
    counter: 100,
    counterStore() {
        dataStore.counter++;
    },
    counterParams(count) {
        dataStore.counter += count;
    },
    decrement() {
        dataStore.counter--;
    }
});

export default dataStore