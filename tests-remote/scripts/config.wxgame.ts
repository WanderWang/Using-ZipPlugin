/// 阅读 api.d.ts 查看文档
///<reference path="api.d.ts"/>

import * as path from 'path';
import { UglifyPlugin, CompilePlugin, ManifestPlugin, ExmlPlugin, EmitResConfigFilePlugin, TextureMergerPlugin, CleanPlugin, ZipPlugin, ResSplitPlugin } from 'built-in';
import { WxgamePlugin } from './wxgame/wxgame';
import { CustomPlugin } from './myplugin';
import * as defaultConfig from './config';

const config: ResourceManagerConfig = {

    buildConfig: (params) => {
        const { target, command, projectName, version } = params;
        const outputDir = `../${projectName}_wxgame`;
        if (command == 'build') {
            return {
                outputDir,
                commands: [
                    new CleanPlugin({ matchers: ["js", "resource"] }),
                    new CompilePlugin({ libraryType: "debug", defines: { DEBUG: true, RELEASE: false } }),
                    new ExmlPlugin('commonjs'), // 非 EUI 项目关闭此设置
                    new WxgamePlugin(),
                    new ZipPlugin({
                        mergeSelector: (p) => {
                            if (p.indexOf("resource/config") >= 0 && p.indexOf(".json") >= 0) {
                                return 'resource/config/1.zip'
                            }
                        }
                    }),
                    new ResSplitPlugin({
                        matchers: [{ from: "**/**/**.zip", to: outputDir + "_remote" }],
                        verbose: true
                    }),
                    new EmitResConfigFilePlugin({
                        output: "resource/default.res.json",
                        typeSelector: config.typeSelector,
                        nameSelector: p => path.basename(p).replace(/\./gi, "_"),
                        groupSelector: p => "preload"
                    }),
                    new ManifestPlugin({ output: 'manifest.js' })
                ]
            }
        }
        else if (command == 'publish') {
            return {
                outputDir,
                commands: [
                    new CleanPlugin({ matchers: ["js", "resource"] }),
                    new CompilePlugin({ libraryType: "release", defines: { DEBUG: false, RELEASE: true } }),
                    new ExmlPlugin('commonjs'), // 非 EUI 项目关闭此设置
                    new WxgamePlugin(),
                    new UglifyPlugin([{
                        sources: ["main.js"],
                        target: "main.min.js"
                    }
                    ]),
                    new ManifestPlugin({ output: 'manifest.js' })
                ]
            }
        }
        else {
            throw `unknown command : ${params.command}`;
        }
    },

    mergeSelector: defaultConfig.mergeSelector,

    typeSelector: defaultConfig.typeSelector
}



export = config;
