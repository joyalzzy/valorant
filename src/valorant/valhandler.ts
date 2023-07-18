import axios, { AxiosInstance, AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import { EntitlementResponse } from "valorant-api-types";
import { ValCache } from "./cache";
export namespace Handler {
    export type TokenResponse = {
        type: "response";
        response: {
            mode: string;
            parameters: {
                uri: string;
            };
        };
        country: string;
    };
}
export class Handler {
    public headers: Array<{}>;
    ax: AxiosInstance;
    cache: ValCache;
    constructor() {
        this.headers = [
            {
                //      "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                //          "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
                "X-Riot-Token": process.env.RIOT_KEY,
            },
        ];
        this.ax = wrapper(
            axios.create({
                jar: new CookieJar(),
                baseURL: "",
                headers: {
                    //      "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                    //          "Content-Type": "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
                    // "X-Riot-Token": process.env.RIOT_KEY,
                },
            }
                // withCredentials: true,
            )
        );
    }
    async sendPostRequest(url: string, headers: {}, data: {}) {
        return await this.ax.post(url, data,
        );
    }
    async sendGetRequest(url: string, headers: {}) {
        return await this.ax.post(url, {
            headers: headers,
        });
    }
    async sendPutRequest(url: string, headers: {}, data: {}) {
        return await this.ax.put(url, data, {
            headers: headers,
        });
    }
    async getAuthedHeaders(user: string, pass: string) {
        // get cookie
        console.log(this.headers[0])
        this.sendPostRequest(
            "https://auth.riotgames.com/api/v1/authorization",
            {},
            {
                "client_id": "play-valorant-web-prod",
                "nonce": "1",
                "redirect_uri": "https://playvalorant.com/opt_in",
                "response_type": "token id_token",
                "scope": "account openid",
            }
        )
            .then((_) => {
                return this.sendPutRequest(
                    "https://auth.riotgames.com/api/v1/authorization",
                    this.headers[0],
                    {
                        type: "auth",
                        username: user,
                        password: pass,
                        rememberDevice: true,
                    }
                );
            })
            .then((_) => {

                // const searchURL =
                // const urlSearch = new URLSearchParams(searchURL.hash)
                //
                // return this.sendPostRequest("https://entitlements.auth.riotgames.com/api/token/v1",
                // {
                // "Authorization": `Bearer ${String(urlSearch.get("#access_token"))}`
                // }, {
                //
                // })
                console.log('hi')
                // console.log(_.data)
            });
    }
}
    // this.access_token = String(urlSearch.get("#access_token"));
    // this.id_token = urlSearch.get("id_token") || "";
    // this.expires_in = Number(urlSearch.get("expires_in") || 0);
    // this.token_type = urlSearch.get("token_type") || "";
    // this.session_state = urlSearch.get("session_state") || "";

    // await this.valRequest(
    //   "https://entitlements.auth.riotgames.com/api/token/v1",
    //   0,
    //   0,
    //   {
        // Authorization: `Bearer ${String(urlSearch.get("#access_token"))}`,
    //   }
    // ).then((res: AxiosResponse<EntitlementResponse>) => {
    //   return res.data.entitlements_token;
    // });
//   }
// }
