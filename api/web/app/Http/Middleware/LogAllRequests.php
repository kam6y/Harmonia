<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogAllRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        Log::info('Incoming request', [
            'method' => $request->getMethod(),
            'uri'    => $request->getRequestUri(),
        ]);

        return $next($request);
    }
}
