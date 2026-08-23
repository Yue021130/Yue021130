# useEffect 与副作用学习笔记

> 基于 `04-lifecycle` 项目中的 `Timer`、`DataFetchDemo`、`DependencyTrap` 整理。

---

## 一、useEffect 的执行时机

`useEffect` 在**每次渲染完成后**执行，具体时机由依赖数组决定。

| 依赖数组 | setup 何时执行 | cleanup 何时执行 |
|---------|--------------|----------------|
| 不写 | 每次渲染后都执行 | 每次重新执行 effect 前执行，卸载时也执行 |
| `[]` | 只在第一次渲染后执行（mount） | 只在卸载前执行（unmount） |
| `[a, b]` | 依赖变化后的那次渲染执行 | 每次重新执行 effect 前执行，卸载时也执行 |

---

## 二、Timer 组件：展示 mount / update / unmount

### 完整生命周期流程

```text
挂载 Timer
    ↓
useEffect([], fn) 执行 setup
    ↓
打印 mount 日志，启动 setInterval
    ↓
每秒 setSeconds(s => s + 1)
    ↓
seconds 变化 → 组件重新渲染
    ↓
useEffect([seconds], fn) 执行，打印 update 日志
    ↓
点击卸载
    ↓
useEffect([], fn) 的 cleanup 执行
    ↓
clearInterval 停止定时器，打印 unmount 日志
```

---

## 三、useRef 与 intervalRef.current

### useRef 是什么？

```jsx
const intervalRef = useRef(null);
```

`intervalRef` 是一个对象：

```js
{
  current: null
}
```

### 为什么要用 useRef？

普通变量每次渲染==都会**重置**==：

```jsx
function Timer() {
  let intervalId = null; // 每次渲染都变回 null

  useEffect(() => {
    intervalId = setInterval(...);
  }, []);
  // 下一次渲染 intervalId 又是 null
}
```

`useRef` 的值在多次渲染之间保持不变：

```jsx
function Timer() {
  const intervalRef = useRef(null); // 同一个对象

  useEffect(() => {
    intervalRef.current = setInterval(...);
  }, []);
  // 下一次渲染，intervalRef.current 还是上一次的 id
}
```

### 特点

- 修改 `intervalRef.current` **不会触发重新渲染**
- 适合保存：定时器 id、DOM 引用、上一轮 state 等跨渲染需要保留的值

### 完整示例

```jsx
const intervalRef = useRef(null);

useEffect(() => {
  // setInterval 返回数字 id
  intervalRef.current = setInterval(() => {
    setSeconds(s => s + 1);
  }, 1000);

  // 卸载时用这个 id 清理
  return () => {
    clearInterval(intervalRef.current);
  };
}, []);
```

---

## 四、setInterval 做了什么？

```js
intervalRef.current = setInterval(() => {
  setSeconds(s => s + 1);
}, 1000);
```

- `setInterval(回调函数, 间隔毫秒数)`：每隔一段时间执行一次回调
- `1000` 毫秒 = 1 秒
- 每秒执行一次 `setSeconds(s => s + 1)`
- 返回一个 id，用来 `clearInterval(id)` 停止定时器

### 为什么用 `s => s + 1`？

`setInterval` 的回调在 1 秒后执行，那时候的 `seconds` 变量可能是旧值。用函数式更新确保基于最新 state 加 1。

---

## 五、useEffect 为什么不能是 async？

### async 函数的问题

`async` 函数**隐式返回 Promise**。

React 期望 useEffect 返回：

- `undefined`（什么都不返回）
- 或者一个 **cleanup 函数**

如果 useEffect 写成 async：

```jsx
useEffect(async () => {
  const data = await fetch(...);
  return () => { /* cleanup */ };
}, []);
```

React 会把这个 Promise 当成 cleanup 函数，结果报错：

```text
Warning: useEffect must not return anything besides a function...
```

### 正确写法

在 useEffect 内部定义 async 函数，然后直接调用：

```jsx
useEffect(() => {
  async function fetchUser() {
    const res = await fetch(...);
    // ...
  }

  fetchUser(); // 直接调用，不用 await

  return () => {
    // cleanup
  };
}, []);
```

### 为什么 `fetchUser()` 前面不加 await？

因为 `await` 只能在 `async` 函数里使用。如果在这里写 `await fetchUser()`，那 useEffect 的回调本身也必须 async，这就又回到了上面的问题。

---

## 六、AbortController：取消未完成的请求

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchUser() {
    const res = await fetch(url, { signal: controller.signal });
    // ...
  }

  fetchUser();

  return () => controller.abort();
}, [userId]);
```

### 作用

当 `userId` 快速变化，或者组件卸载时，取消还没完成的请求，避免：

- 内存泄漏
- 旧请求覆盖新请求结果（竞态条件）

### 流程

```text
userId = 1
    ↓
发起请求 A
    ↓
userId 快速变成 2
    ↓
先执行 cleanup：abort 请求 A
    ↓
再发起请求 B
```

---

## 七、依赖数组陷阱

### 错误：遗漏依赖

```jsx
const [count, setCount] = useState(0);
const [wrong, setWrong] = useState(0);

useEffect(() => {
  setWrong(count * 2);
}, []); // ❌ 遗漏 count
```

`wrong` 永远基于 `count` 的初始值 `0` 计算，不会随 `count` 更新。

### 正确：包含依赖

```jsx
useEffect(() => {
  setCorrect(count * 2);
}, [count]); // ✅
```

`correct` 会在每次 `count` 变化后重新计算。

---

## 八、生命周期对比总结

| 阶段 | 触发条件 | useEffect 写法 |
|------|---------|---------------|
| mount | 组件第一次渲染 | `useEffect(fn, [])` |
| update | state/props 变化导致重新渲染 | `useEffect(fn, [deps])` |
| unmount | 组件从 DOM 移除 | `useEffect(() => () => cleanup, [])` 的 cleanup |

---
