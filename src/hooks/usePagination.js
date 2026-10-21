/*
 * @Description: 通用列表分页 Hook —— 以「请求函数 + 参数」为输入，统一封装
 *               首屏加载 / 上拉加载更多 / 下拉刷新 / 筛选变更重置 / 并发去重 / 错误态。
 * @Usage:
 *   const roster = usePagination(contractsgetRoster, {
 *       params: { seekState, recruitSerialCode, channel: 1 },
 *       pageSize: 10,
 *       loadingText: '加载中...',
 *   })
 *   // 模板：roster.list / roster.totalCount / roster.goonLoad / roster.isRefresh / roster.status
 *   // 事件：onScrollToLower={roster.loadMore}  onRefresherRefresh={roster.refresh}
 *
 * 说明：请求层（src/util/request.js）在业务失败时不会 reject，因此本 Hook 以
 *      「HTTP 已返回 + 业务 code === 200」作为成功判定，与旧页面实现保持一致。
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'

// 请求状态：与旧页面 requestState 的数值语义完全一致，便于平滑迁移
export const PAGINATION_STATE = {
    IDLE: 0,      // 未请求
    LOADING: 1,   // 请求中
    SUCCESS: 2,   // 请求成功
    FAIL: 3,      // 请求失败 / 无数据
}

/**
 * @param {Function} fetcher 请求函数，签名 (requestParams, meta) => Promise<res>
 *                           requestParams 已包含 pageNo / pageSize 以及全部业务参数
 * @param {Object}   options
 * @param {Object}   options.params          响应式请求参数（不含 pageNo/pageSize）；值变化会自动重置到第 1 页
 * @param {Array}    options.deps            额外的重载依赖（如不作为请求参数、但变化时需重新拉取的筛选态）
 * @param {boolean}  options.enabled         是否允许自动加载；用于「前置条件未满足时不请求」的场景，默认 true
 * @param {number}   options.pageSize        每页条数，默认 10
 * @param {boolean}  options.auto            参数变化时是否自动加载，默认 true
 * @param {string}   options.loadingText     非空则在请求期间自动 showLoading / hideLoading
 * @param {boolean}  options.loadingMask     配合 loadingText 使用，默认 false
 * @param {Function} options.getRows         (data) => rows，默认取 data.responses
 * @param {Function} options.transform       (rows, ctx) => list，提交前的数据加工（可选）
 * @param {Function} options.hasMore         (rows, ctx) => boolean，默认 rows.length > 0
 *                                           （与旧实现一致：只要返回非空就认为还能继续加载）
 * @param {Function} options.onSuccess       (data, ctx) => void
 * @param {Function} options.onEmpty         (data, ctx) => void
 * @param {Function} options.onError         (err, ctx) => void
 * @param {Array}    options.initialList     初始列表，默认 []
 */
export function usePagination(fetcher, options = {}) {
    const {
        params: outerParams,
        deps = [],
        enabled = true,
        pageSize = 10,
        auto = true,
        loadingText = '',
        loadingMask = false,
        getRows,
        transform,
        hasMore,
        onSuccess,
        onEmpty,
        onError,
        initialList = [],
    } = options

    // ---------- 状态 ----------
    const [list, setListState] = useState(initialList)
    const [status, setStatusState] = useState(PAGINATION_STATE.IDLE)
    const [goonLoad, setGoonLoadState] = useState(true)
    const [isRefresh, setIsRefreshState] = useState(false)
    const [pageNo, setPageNoState] = useState(1)
    const [totalCount, setTotalCountState] = useState(0)

    // ---------- 引用（供异步回调读取最新值，规避闭包陈旧） ----------
    const listRef = useRef(initialList)
    const statusRef = useRef(PAGINATION_STATE.IDLE)
    const goonLoadRef = useRef(true)
    const pageNoRef = useRef(1)
    const seqRef = useRef(0)                  // 请求序号：只允许最新一次请求提交状态
    const inflightKeysRef = useRef(new Set()) // 并发去重：相同参数的请求不会重复发出
    const mountedRef = useRef(true)

    // 每次渲染同步 list，兼容页面通过 setList 做本地增删改的场景
    listRef.current = list

    const setStatus = useCallback((v) => { statusRef.current = v; if (mountedRef.current) setStatusState(v) }, [])
    const setGoonLoad = useCallback((v) => { goonLoadRef.current = v; if (mountedRef.current) setGoonLoadState(v) }, [])
    const setPageNo = useCallback((v) => { pageNoRef.current = v; if (mountedRef.current) setPageNoState(v) }, [])
    const setIsRefresh = useCallback((v) => { if (mountedRef.current) setIsRefreshState(v) }, [])
    const setTotalCount = useCallback((v) => { if (mountedRef.current) setTotalCountState(v) }, [])

    // setList 与原 useState 的 setList 签名保持兼容：支持直接值与函数式更新
    const setList = useCallback((updater) => {
        setListState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            listRef.current = next
            return next
        })
    }, [])

    // ---------- 请求参数：以序列化结果作为「是否变化」的判据，规避对象字面量每次渲染都变的问题 ----------
    const requestParams = { ...(outerParams || {}) }
    const paramsKey = JSON.stringify(requestParams)
    const paramsRef = useRef(requestParams)
    paramsRef.current = requestParams

    // ---------- 回调 / 配置统一放 ref，保证 load 的引用稳定 ----------
    const confRef = useRef({})
    confRef.current = { fetcher, getRows, transform, hasMore, onSuccess, onEmpty, onError, loadingText, loadingMask, pageSize }

    useEffect(() => {
        mountedRef.current = true
        return () => { mountedRef.current = false }
    }, [])

    // ---------- 核心请求 ----------
    const load = useCallback(async (targetPage = 1, meta) => {
        const page = targetPage > 0 ? targetPage : 1
        const conf = confRef.current
        const reqParams = { ...paramsRef.current, pageNo: page, pageSize: conf.pageSize }

        // 并发去重：同一份参数（含 meta）已在飞行中则直接跳过，避免小程序滚动/生命周期重复触发
        const key = `${JSON.stringify(reqParams)}|${meta ? JSON.stringify(meta) : ''}`
        if (inflightKeysRef.current.has(key)) return null
        inflightKeysRef.current.add(key)

        const seq = ++seqRef.current
        const isReset = page === 1
        const ctx = { pageNo: page, meta, params: reqParams, isReset }

        setStatus(PAGINATION_STATE.LOADING)
        if (conf.loadingText) Taro.showLoading({ title: conf.loadingText, mask: conf.loadingMask })

        try {
            const res = await conf.fetcher(reqParams, meta)
            // 已被更新的请求取代：丢弃本次结果，不写任何状态
            if (seq !== seqRef.current) return null

            const { code, data } = res || {}
            const rows = (conf.getRows ? conf.getRows(data) : data?.responses) || []
            const _hasMore = conf.hasMore ? conf.hasMore(rows, ctx) : rows.length > 0

            if (code === 200 && rows.length > 0) {
                const mapped = conf.transform ? conf.transform(rows, ctx) : rows
                setList(isReset ? mapped : [...listRef.current, ...mapped])
                setGoonLoad(!!_hasMore)
                setPageNo(data?.pageNo ?? page)
                setTotalCount(data?.totalCount ?? 0)
                setStatus(PAGINATION_STATE.SUCCESS)
                conf.onSuccess?.(data, ctx)
            } else {
                setGoonLoad(false)
                setStatus(PAGINATION_STATE.FAIL)
                setTotalCount(data?.totalCount ?? 0)
                if (isReset) setList([])
                conf.onEmpty?.(data, ctx)
            }
            setIsRefresh(false)
            return res
        } catch (err) {
            if (seq !== seqRef.current) return null
            // 与原实现一致：异常时进入失败态并停止继续加载
            setGoonLoad(false)
            setStatus(PAGINATION_STATE.FAIL)
            setIsRefresh(false)
            conf.onError?.(err, ctx)
            return null
        } finally {
            inflightKeysRef.current.delete(key)
            if (conf.loadingText) Taro.hideLoading()
        }
    }, [setGoonLoad, setIsRefresh, setList, setPageNo, setStatus, setTotalCount])

    // ---------- 上拉加载下一页 ----------
    const loadMore = useCallback(() => {
        if (statusRef.current === PAGINATION_STATE.LOADING) return null // 请求中不重复触发
        if (!goonLoadRef.current) return null                           // 已到底
        return load(pageNoRef.current + 1)
    }, [load])

    // ---------- 下拉刷新（带 refresher 动画态） ----------
    const refresh = useCallback(() => {
        setIsRefresh(true)
        return load(1)
    }, [load, setIsRefresh])

    // ---------- 静默重载第 1 页（不触发下拉动画，用于搜索 / 数据变更后） ----------
    const reload = useCallback((meta) => load(1, meta), [load])

    // ---------- 响应式参数变化 / 首次挂载 → 重置到第 1 页 ----------
    useEffect(() => {
        if (!auto || !enabled) return
        load(1)
        // paramsKey 已覆盖全部请求参数，paramsRef 保证取到最新值；
        // deps 供「不参与请求但变化时需重载」的筛选态使用
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey, auto, enabled, ...deps])

    return {
        // 数据与状态
        list,
        setList,
        status,
        goonLoad,
        isRefresh,
        pageNo,
        totalCount,
        loading: status === PAGINATION_STATE.LOADING,
        isEmpty: list.length === 0 && status === PAGINATION_STATE.FAIL,
        // 行为
        load,
        loadMore,
        refresh,
        reload,
    }
}

export default usePagination
