/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2025-05-06 09:59:45
 * @LastEditors: 孙林
 * @LastEditTime: 2025-05-06 10:01:59
 * @Description: 渠道、驻场角色的名单页面
 */

import { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import ChannelList from '@/pages/channelList'
import OnSiteList from '@/pages/onSiteList'
import './index.scss'


const Index = observer(({ store }) => {
    const {
        userStore: { role },
    } = store;
    useEffect(() => {

    }, [])
    return (
        <>
            {
                role == 'ON_SITE' ? <OnSiteList /> : role == 'CHANNEL' ? <ChannelList /> : ''
            }
        </>
    )
})

export default inject('store')(Index)
