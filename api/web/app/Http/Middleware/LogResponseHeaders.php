<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogResponseHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // レスポンスに含まれる全てのヘッダーをログに出力する
        Log::info('Response headers:', $response->headers->all());

        return $response;
    }
}

