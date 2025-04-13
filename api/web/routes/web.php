<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/test-session', function () {
    // セッションに保存されているすべてのデータを取得
    $sessionData = session()->all();

    // セッションデータをログに出力
    Log::info('Session Data:', $sessionData);

    // config('session.same_site') も合わせて返す
    return response()->json([
        'session_data' => $sessionData,
        'session_same_site' => config('session.same_site')
    ]);
});


