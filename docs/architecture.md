# アーキテクチャ

## 全体構成

```
ブラウザ (React + Three.js)
    │
    │ /api/* (Vite proxy)
    ▼
FastAPI (Python)
    │
    ▼
Depth Anything V2 Small (PyTorch)
```

## データフロー

### Panorama Mode
1. ユーザーが 360° パノラマ画像をドロップ
2. Three.js で SphereGeometry の内側にテクスチャ適用
3. OrbitControls で見回し（回転のみ）
4. FOV 変更可能
5. オフスクリーンレンダリングで PNG 出力

### Image Background Mode
1. ユーザーが通常画像をドロップ
2. FastAPI に画像を POST
3. Depth Anything V2 Small で Depth Map を推定
4. グレースケール PNG を返却
5. PlaneGeometry (128×128) の頂点を Depth 値で Z 方向に変位
6. 元画像をテクスチャとして適用
7. カメラ位置を ±15% の範囲で移動可能
8. PNG 出力

## 主要コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| `PanoramaScene.ts` | 球体 + OrbitControls + アニメーションループ |
| `ImageScene.ts` | 2.5D メッシュ + カメラオフセット制御 |
| `mesh-builder.ts` | Depth Map → 頂点変位の変換 |
| `export.ts` | オフスクリーン PNG エクスポート |
| `depth_service.py` | Depth Anything V2 のラッパー（遅延ロード） |

## 状態管理

Zustand の単一ストアでフラット構造。モード、画像、Depth 状態、カメラ位置、出力設定を管理。
