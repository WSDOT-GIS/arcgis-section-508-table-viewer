const path = require('path');

function makeConfig(entry, filename) {
  return {
    entry: entry,
    mode: "production",
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    output: {
      filename: filename,
      path: path.resolve(__dirname, 'script')
    }
  };
}

browser = makeConfig("./src/browser/index.ts", "index.js")
worker = makeConfig("./src/worker/arcgisWorker.ts", "arcgisWorker.js")


module.exports = [browser, worker];