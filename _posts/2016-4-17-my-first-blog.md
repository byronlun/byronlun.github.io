---
layout: post
title: start learning redux just api
---

1. combineReducers() 所做的只是生成一个函数，这个函数来调用你的一系列 reducer，每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，然后这个生成的函数所所有 reducer 的结果合并成一个大的对象。

>ES6 用户使用注意
combineReducers 接收一个对象，可以把所有顶级的 reducer 放到一个独立的文件中，通过 export 暴露出每个 reducer 函数，然后使用 import * as reducers 得到一个以它们名字作为 key 的 object：
```js
import { combineReducers } from 'redux';
import * as reducers from './reducers';
const todoApp = combineReducers(reducers);
```

由于 import * 还是比较新的语法，为了避免困惑，不会在文档使用它。但在一些社区示例中可能会遇到它们。
