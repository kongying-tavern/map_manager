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
        alert(error);
    }

}
//查询所有用户
function user_select() {
    return defalut_request("get", "http://api.yuanshen.site:8089/api/user/-1")
}
export {
    user_select
}