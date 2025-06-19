<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="@yield('html-class')">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">


    @yield('metatags')

    {{-- Динамические стили --}}
    @if (app()->environment('local'))
        @vite($styles)
    @elseif (file_exists(public_path('build/manifest.json')))
        @php
            $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
        @endphp
        @foreach ($styles as $style)
            @if (isset($manifest[$style]['file']))
                <link rel="stylesheet" href="/build/{{ $manifest[$style]['file'] }}">
            @endif
        @endforeach
    @endif

    @yield('head')
</head>

<body class="@yield('body-class')" @yield('body-attributes')>

    @yield('header')

    <main>
        @yield('content')
    </main>

    @yield('footer')

    {{-- Modals --}}
    @stack('modals')

    {{-- Динамические скрипты --}}
    @if (app()->environment('local'))
        @vite($scripts)
    @elseif (file_exists(public_path('build/manifest.json')))
        @foreach ($scripts as $script)
            @if (isset($manifest[$script]['file']))
                <script src="/build/{{ $manifest[$script]['file'] }}"></script>
            @endif
        @endforeach
    @endif

    @yield('body')
</body>

</html>
