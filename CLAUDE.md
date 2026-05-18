# CLAUDE.md — BG Camera Studio

> 背景素材制作に特化した軽量カメラ再構図ツール

## このプロジェクトの目的

通常画像を Depth 推定で 2.5D 化、または 360° パノラマ画像を球体マッピングし、カメラを動かして背景素材を PNG 出力するローカル Web アプリ。

## 技術スタック

- Frontend: Vite + React + TypeScript + Three.js + Zustand + Tailwind CSS
- Backend: Python + FastAPI + Depth Anything V2 Small
- パッケージマネージャー: npm
- ポート: フロント 5173 / バックエンド 8000

## 進め方

- 複雑な実装・デバッグ・レビューは **Codex** を優先する（`/codex:rescue`）
- Web検索・ログ解析・高速パイプ処理は **Gemini CLI** を優先する
- 全体設計・判断・統合は **Claude Code** が担当する

## 起動方法

```bash
# フロント + バックエンド同時起動
cd frontend && npm run dev

# バックエンドのみ
cd backend && .venv/Scripts/python -m uvicorn main:app --reload --port 8000
```

## 編集ルール

- 詳細は `AGENTS.md` を参照
- 現在の作業範囲は `_PROJECT_STATE.md` を参照

## やらないこと

- 確認なしの破壊的変更
- `.env` や認証情報の外部送信
- MVP 範囲外の機能追加（3Dオブジェクト配置、タイムライン、NeRF等）
