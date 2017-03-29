#!/usr/bin/env node
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');
const Table = require('cli-table2');
const superagent = require('superagent');
// const fs = require('fs');

//默认有道翻译
const youdaoApi = 'http://fanyi.youdao.com/openapi.do?keyfrom=toaijf&key=868480929&type=data&doctype=json&version=1.1';

const baiduApi = 'http://fanyi.baidu.com/v2transapi';

program.version('1.0.0')
    .usage('[options]');  //使用说明


program.command('youdao')
    .description('有道翻译')
    .alias('y')
    .action(function(){
        co(function*(){
            var word = yield prompt('[有道]请输入你要翻译的文本: ');
            superagent.get(youdaoApi)
                .query({q:word})
                .end(function(err,res){
                    if(err){
                        console.log('请求异常请重试');
                        return;
                    }
                    //console.log(res.text);
                    var data = JSON.parse(res.text);
                    var result,detail;
                    if(data.basic){
                        detail = data['basic']['explains'].join('\n');
                    }
                    if(data.translation){
                        result = data['translation'][0];
                    }else{
                        console.log('有道服务异常');
                    }
                    console.log(detail || result);
                    var table = new Table({
                        head : ['时间','出处']
                    });
                    var oDate = new Date();
                    table.push([oDate.getFullYear()+'-'+(oDate.getMonth()+1)+'-'+oDate.getDate(),'有道']);
                    console.log(table.toString());
                });
             process.stdin.pause();
        })
    });

program.command('baidu')
    .description('百度翻译')
    .alias('b')
    .option('-e, --english','翻译为英文')
    .option('-c, --chinese','翻译为中文')
    .action(function(options){
        var send = {};
        if(options.english){
            send = {from:'zh',to:'en'}
        }else if(options.chinese){
            send = {from:'en',to:'zh'}
        }else{
            console.log('   百度翻译需要配置相应参数：-e,--english | -c,--chiness');
            program.help();
            return;
        }
        co(function*(){
            var word = yield prompt('[百度]请输入你要翻译的文本: ');
            send['query'] = word;
            superagent.post(baiduApi)
                .query(send)
                .end(function(err,res){
                    if(err){
                        console.log('请求异常请重试');
                        return;
                    }
                    var data = JSON.parse(res.text);
                    if(data.trans_result){
                        console.log(data.trans_result.data[0].dst);
                    }
                });
            process.stdin.pause();
        });
    });

program.on('--help',function(){
    console.log('Example: ');
    console.log('');
    console.log('  $ translator y');
    console.log('  $ translator b -c|-e');
    console.log('');
});

if(!process.argv[2]){
    program.help();
}

program.parse(process.argv);
