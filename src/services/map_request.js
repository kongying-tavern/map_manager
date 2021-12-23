//地图相关请求函数
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url) {
    let ts = Date.now() - Cookies.get("time_difference");
    let sign = md5(ts + "site.yuanshen");
    return axios({
        method: method,
        url: url,
        headers: { ts: ts, sign: sign },
    }).catch(error => {
        alert(error);
    });

}
//请求点位数据信息
function options_type_select() {
    return defalut_request('get', "http://api.yuanshen.site:8089/api/option")
}
//请求选中点位类型下所有点位类型信息
function layer_data_select(id) {
    return defalut_request('get', `http://api.yuanshen.site:8089/api/marker/${id}`)
}
//按关键字查询点位信息
function layer_keyword_select(keyword) {
    return defalut_request('get', `http://api.yuanshen.site:8089/api/option?keyword=${keyword}`)
}
export { defalut_request, options_type_select, layer_data_select, layer_keyword_select }