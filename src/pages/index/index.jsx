/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:01:04
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-03 13:58:18
 * @Description: 
 */
import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { observer, inject } from 'mobx-react';
import s from './index.module.styl'

const Index = observer(({ store }) => {
  const [i, seti] = useState(0);
  const {
    dataStore: {
      counter, counterStore, counterParams, decrement
    },
  } = store

  useEffect(() => {
    seti(counter);
  },[counter]);


  const clickFunc = (type) => {
    if (type === "add") {
      counterStore();
    } else if (type === "addparams") {
      counterParams(25);
    } else {
      decrement();
    }
  }

  return (
    <View className={s.container}>
      <Button onClick={() => { clickFunc("addparams") }}>add addparams</Button>
      <Button onClick={() => { clickFunc("add") }}>add count</Button>
      <Button onClick={() => { clickFunc("reduce") }}>reduce count</Button>
      <View>counter:{counter}</View>
      <View>i:{i}</View>
    </View>
  )
})

export default inject('store')(Index)
