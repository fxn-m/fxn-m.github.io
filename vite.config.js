import path from 'path'

export default {
    base: 'https://fxn-m.com/',
    root: path.resolve(__dirname, 'src'),
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
    },
    server: {
        port: 8080,
        hot: true
    }
}