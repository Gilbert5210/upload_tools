/**
 * 请求返回
 */

function successResponse (data = {}, message = '') {

    return {
        'code': 200,
        'success': true,
        'msg': message,
        'data': data
    };
}

function failureResponse (message = '系统异常，请重试或联系技术支持', data = {}) {

    return {
        'code': -1,
        'success': false,
        'msg': message,
        'data': data
    };
}

module.exports = {
    success: successResponse,
    failure: failureResponse
}
