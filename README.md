# aurora 的内务小猪手

手机端优先的商户上线流程跟踪 PWA。应用用于添加商户、勾选上线步骤、查看当前阶段和完成进度，并通过本机浏览器保存数据。

## 功能

- 添加商户后自动生成 6 个上线阶段。
- 勾选步骤时自动记录完成时间。
- 首页显示商户数量、平均进度、已完成数量、当前阶段和最近更新时间。
- 支持商户搜索。
- 支持 JSON 导入和导出，用于手动备份或换机恢复。
- 生产构建包含 PWA manifest 和 service worker。

## 运行

```bash
npm install
npm run dev
```

## 构建与检查

```bash
npm run build
npm run lint
```
