const loginURL = "https://feiniaoyun.xyz/api/v1/passport/auth/login";
const getSubscribeURL = "https://feiniaoyun.xyz/api/v1/user/getSubscribe";
const defaultUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.6943.54 Safari/537.36";

const handleRequest = async (request) => {
    try {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const search = url.search;

        return new Response(JSON.stringify({ url, pathname, search }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });

        // 1. 检查请求路径
        if (pathname !== "/api/v1/client/subscribe") {
            return new Response(JSON.stringify({ code: 404, message: "Resource Not Found" }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. 检查token参数
        const token = url.searchParams.get("token");

        // 3. 获取User-Agent
        const userAgent = request.headers.get("User-Agent") || defaultUserAgent;

        // 4. 登录请求
        const loginResponse = await fetch(loginURL, {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Content-Language": "zh-CN",
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": "https://feiniaoyun.xyz/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": defaultUserAgent
            },
            body: "email=m33ed444vjk%40outlook.com&password=qwerGBNM%2C.%2F1234!%40%23%24"
        });
        if (loginResponse.status !== 200 || !loginResponse.ok) {
            return new Response(JSON.stringify({ code: 401, message: "登录失败" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 5. 提取 auth_data 和 authToken
        const loginData = await loginResponse.json();
        const authData = loginData.data?.auth_data;

        if (!authData) {
            throw new Error('获取订阅失败');
        }

        // 7. 获取订阅信息
        const subscribeResponse = await fetch(getSubscribeURL, {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Authorization": authData,
                "Content-Language": "zh-CN",
                "Referer": "https://feiniaoyun.xyz/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": defaultUserAgent
            }
        });

        if (subscribeResponse.status !== 200 || !subscribeResponse.ok) {
            return new Response(JSON.stringify({ error: "获取订阅失败", status: subscribeResponse.status }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 8. 提取 subscribe_url
        const subscribeData = await subscribeResponse.json();
        const subscribeUrl = subscribeData?.data?.subscribe_url || subscribeData?.subscribe_url;

        if (!subscribeUrl) {
            throw new Error('获取订阅失败');
        }

        // 9. 请求订阅URL
        const finalResponse = await fetch(subscribeUrl, {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Referer": "https://feiniaoyun.xyz/",
                "User-Agent": userAgent
            }
        });

        if (finalResponse.status !== 200 || !finalResponse.ok) {
            return new Response(JSON.stringify({ error: "获取订阅内容失败", status: finalResponse.status }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 10. 创建新的响应头对象
        const responseHeaders = new Headers();

        // 复制所有原始响应头
        finalResponse.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });

        // 11. 返回响应，保持原始内容和头
        return new Response(finalResponse.body, {
            status: finalResponse.status,
            statusText: finalResponse.statusText,
            headers: responseHeaders
        });
    } catch (error) {
        // 错误处理
        return new Response(JSON.stringify({
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
};

export default async (req, context) => {
    return handleRequest(req);
};
