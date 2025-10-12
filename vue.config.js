const { defineConfig } = require('@vue/cli-service')
const ESLintPlugin = require('eslint-webpack-plugin')
const path = require('path')            // ✅ 补这行

module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: (config) => {
        // 去掉 Vue CLI 默认注入的旧版本 ESLint 插件（会用 extensions，和 ESLint 9 冲突）
        config.plugins.delete('eslint')
        // 注入与 ESLint 9 兼容的 eslint-webpack-plugin@4
        config.plugin('eslint').use(ESLintPlugin, [{
            // ✅ 必须用 files（glob），不要用 extensions
            files: ['src/**/*.{js,jsx,ts,tsx,vue}'],
            overrideConfigFile: path.resolve(__dirname, '.eslintrc.js'),    // 明确指定配置文件

            // fix: false,
            // lintDirtyModulesOnly: true,
        }])
    }
})
