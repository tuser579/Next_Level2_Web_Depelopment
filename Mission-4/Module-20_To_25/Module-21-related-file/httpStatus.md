# 🌐 HTTP Status Codes — Complete Reference

> A quick reference guide to all standard HTTP status codes with explanations.

---

## 📦 npm Package

```bash
npm install http-status-codes
```

```ts
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND });
```

---

## 📋 Table of Contents

- [1xx — Informational](#1xx--informational)
- [2xx — Success](#2xx--success)
- [3xx — Redirection](#3xx--redirection)
- [4xx — Client Errors](#4xx--client-errors)
- [5xx — Server Errors](#5xx--server-errors)

---

## 1xx — Informational

> The request was received and the process is continuing.

| Code | Constant (`StatusCodes.`) | Name | Explanation |
|------|--------------------------|------|-------------|
| `100` | `CONTINUE` | **Continue** | Server received initial part of request. Client should continue sending the rest. |
| `101` | `SWITCHING_PROTOCOLS` | **Switching Protocols** | Server agrees to switch protocols (e.g., HTTP → WebSocket). |
| `102` | `PROCESSING` | **Processing** | Server has received and is processing the request, but no response yet (WebDAV). |
| `103` | `EARLY_HINTS` | **Early Hints** | Returns some response headers before the final HTTP message to help preload resources. |

---

## 2xx — Success ✅

> The request was successfully received, understood, and accepted.

| Code | Constant (`StatusCodes.`) | Name | Explanation |
|------|--------------------------|------|-------------|
| `200` | `OK` | **OK** | Standard success response. The request has succeeded. |
| `201` | `CREATED` | **Created** | A new resource has been successfully created (e.g., after POST). |
| `202` | `ACCEPTED` | **Accepted** | Request accepted for processing, but processing is not yet complete. |
| `203` | `NON_AUTHORITATIVE_INFORMATION` | **Non-Authoritative Information** | Response is from a third party, not the origin server. |
| `204` | `NO_CONTENT` | **No Content** | Request succeeded, but there is no content to return (e.g., after DELETE). |
| `205` | `RESET_CONTENT` | **Reset Content** | Request succeeded. Client should reset the document view (e.g., clear a form). |
| `206` | `PARTIAL_CONTENT` | **Partial Content** | Server is delivering only part of the resource (range requests / file downloads). |
| `207` | `MULTI_STATUS` | **Multi-Status** | Multiple status codes for multiple operations (WebDAV). |
| `208` | `ALREADY_REPORTED` | **Already Reported** | Members of a DAV binding have already been enumerated (WebDAV). |
| `226` | `IM_USED` | **IM Used** | Server fulfilled a GET request using instance-manipulation (delta encoding). |

---

## 3xx — Redirection 🔀

> Further action is needed to complete the request.

| Code | Constant (`StatusCodes.`) | Name | Explanation |
|------|--------------------------|------|-------------|
| `300` | `MULTIPLE_CHOICES` | **Multiple Choices** | Multiple options for the resource; the client must choose one. |
| `301` | `MOVED_PERMANENTLY` | **Moved Permanently** | Resource has been permanently moved to a new URL. Update your links! |
| `302` | `MOVED_TEMPORARILY` | **Found** | Resource is temporarily at a different URL (temporary redirect). |
| `303` | `SEE_OTHER` | **See Other** | Redirects the client to a different URI using a GET request (often after POST). |
| `304` | `NOT_MODIFIED` | **Not Modified** | Resource hasn't changed since the last request; use the cached version. |
| `305` | _(deprecated)_ | **Use Proxy** | ⚠️ Deprecated. Client must access the resource through a proxy. |
| `307` | `TEMPORARY_REDIRECT` | **Temporary Redirect** | Same as 302, but the HTTP method must not change on redirect. |
| `308` | `PERMANENT_REDIRECT` | **Permanent Redirect** | Same as 301, but the HTTP method must not change on redirect. |

---

## 4xx — Client Errors ❌

> The request contains bad syntax or cannot be fulfilled by the server.

| Code | Constant (`StatusCodes.`) | Name | Explanation |
|------|--------------------------|------|-------------|
| `400` | `BAD_REQUEST` | **Bad Request** | Server cannot process the request due to malformed syntax or invalid data. |
| `401` | `UNAUTHORIZED` | **Unauthorized** | Authentication is required and has failed or not been provided. (You need to log in.) |
| `402` | `PAYMENT_REQUIRED` | **Payment Required** | Reserved for future use. Sometimes used for paywalled content. |
| `403` | `FORBIDDEN` | **Forbidden** | Server understood the request, but refuses to authorize it. (No permission.) |
| `404` | `NOT_FOUND` | **Not Found** | The requested resource could not be found on the server. |
| `405` | `METHOD_NOT_ALLOWED` | **Method Not Allowed** | HTTP method used is not supported for this resource (e.g., GET on a POST-only route). |
| `406` | `NOT_ACCEPTABLE` | **Not Acceptable** | Server cannot produce a response matching the `Accept` headers of the request. |
| `407` | `PROXY_AUTHENTICATION_REQUIRED` | **Proxy Authentication Required** | Authentication with a proxy server is required. |
| `408` | `REQUEST_TIMEOUT` | **Request Timeout** | Server timed out waiting for the client's request. |
| `409` | `CONFLICT` | **Conflict** | Request conflicts with the current state of the resource (e.g., duplicate entry). |
| `410` | `GONE` | **Gone** | Resource has been permanently deleted and will not be available again. |
| `411` | `LENGTH_REQUIRED` | **Length Required** | Request must include a `Content-Length` header. |
| `412` | `PRECONDITION_FAILED` | **Precondition Failed** | One or more conditions in the request headers evaluated to false. |
| `413` | `REQUEST_TOO_LONG` | **Content Too Large** | Request body is larger than the server is willing to process. |
| `414` | `REQUEST_URI_TOO_LONG` | **URI Too Long** | URI provided was too long for the server to process. |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | **Unsupported Media Type** | Media format of the requested data is not supported by the server. |
| `416` | `REQUESTED_RANGE_NOT_SATISFIABLE` | **Range Not Satisfiable** | Range specified in the request cannot be fulfilled (e.g., file is smaller). |
| `417` | `EXPECTATION_FAILED` | **Expectation Failed** | Server cannot meet the requirements of the `Expect` request header. |
| `418` | `IM_A_TEAPOT` | **I'm a Teapot** | 🫖 Easter egg from RFC 2324. The server refuses to brew coffee because it is a teapot. |
| `421` | `MISDIRECTED_REQUEST` | **Misdirected Request** | Request was directed at a server that is not able to produce a response. |
| `422` | `UNPROCESSABLE_ENTITY` | **Unprocessable Content** | Request was well-formed but had semantic errors (e.g., validation failed). |
| `423` | `LOCKED` | **Locked** | The resource being accessed is locked (WebDAV). |
| `424` | `FAILED_DEPENDENCY` | **Failed Dependency** | Request failed due to failure of a previous request (WebDAV). |
| `425` | `TOO_EARLY` | **Too Early** | Server is unwilling to risk processing a request that might be replayed. |
| `426` | `UPGRADE_REQUIRED` | **Upgrade Required** | Client must switch to a different protocol (e.g., TLS/1.0). |
| `428` | `PRECONDITION_REQUIRED` | **Precondition Required** | Origin server requires the request to be conditional to prevent lost updates. |
| `429` | `TOO_MANY_REQUESTS` | **Too Many Requests** | Client has sent too many requests in a given time (rate limiting). |
| `431` | `REQUEST_HEADER_FIELDS_TOO_LARGE` | **Request Header Fields Too Large** | Server is unwilling to process the request due to large header fields. |
| `451` | `UNAVAILABLE_FOR_LEGAL_REASONS` | **Unavailable For Legal Reasons** | Resource is unavailable due to legal reasons (e.g., censorship, DMCA). |

---

## 5xx — Server Errors 🔥

> The server failed to fulfil a valid request.

| Code | Constant (`StatusCodes.`) | Name | Explanation |
|------|--------------------------|------|-------------|
| `500` | `INTERNAL_SERVER_ERROR` | **Internal Server Error** | A generic error occurred on the server. Something went wrong! |
| `501` | `NOT_IMPLEMENTED` | **Not Implemented** | Server does not support the functionality required to fulfill the request. |
| `502` | `BAD_GATEWAY` | **Bad Gateway** | Server, acting as a gateway, received an invalid response from an upstream server. |
| `503` | `SERVICE_UNAVAILABLE` | **Service Unavailable** | Server is currently unavailable (overloaded or down for maintenance). |
| `504` | `GATEWAY_TIMEOUT` | **Gateway Timeout** | Server, acting as a gateway, did not receive a timely response from an upstream server. |
| `505` | `HTTP_VERSION_NOT_SUPPORTED` | **HTTP Version Not Supported** | HTTP version used in the request is not supported by the server. |
| `506` | `VARIANT_ALSO_NEGOTIATES` | **Variant Also Negotiates** | Server has an internal configuration error with content negotiation. |
| `507` | `INSUFFICIENT_STORAGE` | **Insufficient Storage** | Server is unable to store the representation needed to complete the request (WebDAV). |
| `508` | `LOOP_DETECTED` | **Loop Detected** | Server detected an infinite loop while processing the request (WebDAV). |
| `510` | `NOT_EXTENDED` | **Not Extended** | Further extensions to the request are required for the server to fulfill it. |
| `511` | `NETWORK_AUTHENTICATION_REQUIRED` | **Network Authentication Required** | Client needs to authenticate to gain network access (e.g., captive portals). |

---

## 🧠 Quick Memory Guide

```
1xx → Informational  (Hold on...)
2xx → Success        (Here you go!)
3xx → Redirection    (Go over there!)
4xx → Client Error   (You messed up!)
5xx → Server Error   (I messed up!)
```

---

## 🔥 Most Common Status Codes (Daily Use)

| Code | `StatusCodes.` Constant | When to Use |
|------|------------------------|-------------|
| `200` | `OK` | Successful GET / general success |
| `201` | `CREATED` | Resource created (POST) |
| `204` | `NO_CONTENT` | Success with no response body (DELETE/PUT) |
| `400` | `BAD_REQUEST` | Bad request / validation error |
| `401` | `UNAUTHORIZED` | Not logged in / missing token |
| `403` | `FORBIDDEN` | Logged in but no permission |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Conflict / duplicate data |
| `422` | `UNPROCESSABLE_ENTITY` | Semantic validation failed |
| `429` | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected server error |

---

> 📖 **Reference**: [npm: http-status-codes](https://www.npmjs.com/package/http-status-codes) | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) | [RFC 9110](https://httpwg.org/specs/rfc9110.html)
