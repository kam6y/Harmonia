<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ManagerMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::guard('staff')->check() && Auth::guard('staff')->user()->is_manager) {
            return $next($request);
        }
        
        return response()->json(['message' => '権限がありません'], 403);
    }
}