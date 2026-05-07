# 最小 Smoke Test 方案

## 目标
用于在不引入大规模测试维护成本的前提下，快速发现以下高频故障：
- 路由白屏
- 旧缓存崩溃
- render-phase update / maximum update depth
- 对象直接渲染导致的 React 错误
- 演示数据链路断裂

## 建议优先级

### Smoke-1：加载演示数据后链路可打开
- 打开 `/dashboard`
- 点击“加载演示数据”
- 依次访问：
  - `/owner`
  - `/owner/result`
  - `/integrator`
  - `/integrator/result`
  - `/vendor`
  - `/vendor/result`
  - `/selection`
  - `/gap`
  - `/report`
  - `/translation-center`
- 期望：页面无白屏，无 React overlay，无控制台红错

### Smoke-2：空白项目链路可推进
- 清空本地存储
- 打开 `/dashboard`
- 进入 `/owner`
- 填最少必填信息并推进
- 至少能进入 `/integrator`
- 期望：不出现 provider 循环、render-phase update、对象渲染错误

### Smoke-3：刷新恢复
- 在 `/owner`、`/integrator`、`/vendor` 各自填写到一半
- 刷新页面
- 期望：草稿恢复，不白屏，不报错

### Smoke-4：旧缓存兼容
- 使用一个缺少 `gapClosure`、`deliverables` 等新字段的旧状态对象写入 localStorage
- 打开任意主流程页
- 期望：系统自动补齐默认结构，不崩溃

## 执行建议
- 优先人工执行，先把路径稳定住
- 稳定后再把 Smoke-1 和 Smoke-4 转成 Playwright
