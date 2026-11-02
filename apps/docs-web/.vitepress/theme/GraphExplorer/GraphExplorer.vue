<!-- Vue's `src` import keeps HTML/JS/CSS in separate files (no `<script setup>`
     here — the SFC spec disallows pairing `setup` with a `src` import, since
     its compile-time macros need the literal content inline). -->
<template src="./template.html"></template>
<script src="./script.ts"></script>
<style src="./style.css" scoped></style>
