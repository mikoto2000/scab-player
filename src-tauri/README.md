# src-tauri

## test

現状、テスト内で SQLite テーブルに読み書きを行うため、並列化できない。

```sh
cargo test -- --nocapture --test-threads=1
```

## schema 再生成

`./migrations/*_create_scab-player/up.sql`, `./migrations/*_create_scab-player/down.sql` を更新して以下コマンドを実行。

```sh
diesel migration redo
```

## diesel_cli インストール

```sh
cargo install diesel_cli --no-default-features --features "sqlite-bundled"
```

