//点位审核相关
import axios from 'axios'
import { Cookies } from "quasar";
import md5 from "js-md5";
//默认请求封装
async function defalut_request(method, url, data) {
    let ts = Date.now() - Cookies.get("time_difference");
    let sign = md5(ts + "site.yuanshen");
    try {
        return await axios({
            method: method,
            url: url,
            headers: {
                'ts': ts,
                'sign': sign,
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('user_token')
            },
            data: JSON.stringify({ ...data })
        });
    } catch (error) {
        alert(`错误：${error.response.data.msg}`);
    }

}
//用户自查询标点
function user_addlayer_select(itemid = -1, keyword = '') {
    let url = `http://api.yuanshen.site:8089/api/punctuate/${itemid}`
    if (keyword != '') {
        url += `keyword=${keyword}`
    }
    return defalut_request('get', url)
}
//提交新增点位到审核
function addlayer_handle(method, data) {
    return defalut_request(method, "http://api.yuanshen.site:8089/api/punctuate", data)
}
//待审核点位查询
function select_addlayer(id = -1) {
    return defalut_request('get', `http://api.yuanshen.site:8089/api/verify/${id}`)
}
//删除待审核点位
function delete_addlayer(id) {
    return defalut_request('delete', `http://api.yuanshen.site:8089/api/verify?punctuateIds=${id}`)
}
//待审核点位通过
function pass_addlayer(data) {
    return defalut_request('post', `http://api.yuanshen.site:8089/api/verify/`, data)
}
//待审核点位拒绝
function refuse_addlayer(data) {
    return defalut_request('post', `http://api.yuanshen.site:8089/api/verify/reject`, data)
}
export {
    addlayer_handle,
    select_addlayer,
    delete_addlayer,
    pass_addlayer,
    user_addlayer_select,
    refuse_addlayer
}