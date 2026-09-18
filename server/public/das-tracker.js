(function () {
  'use strict'

  var scriptEl = document.currentScript
  var API_BASE = (scriptEl && new URL(scriptEl.src).origin) || ''

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  }

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie =
      name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAgeSeconds + '; SameSite=Lax'
  }

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID()
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0
      var v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  var TWO_YEARS = 60 * 60 * 24 * 365 * 2
  var THIRTY_MIN = 60 * 30

  var visitorId = getCookie('_das_vid')
  if (!visitorId) {
    visitorId = uuid()
    setCookie('_das_vid', visitorId, TWO_YEARS)
  }

  var sessionId = getCookie('_das_sid')
  if (!sessionId) {
    sessionId = uuid()
  }
  setCookie('_das_sid', sessionId, THIRTY_MIN)

  function getParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name)
    } catch {
      return null
    }
  }

  function detectDevice() {
    var ua = navigator.userAgent || ''
    if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile'
    if (/iPad|Tablet/i.test(ua)) return 'Tablet'
    return 'Desktop'
  }

  function send(eventName, extra) {
    var payload = {
      event_id: uuid(),
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: eventName,
      page_url: window.location.href,
      referrer: document.referrer || null,
      utm_source: getParam('utm_source'),
      utm_medium: getParam('utm_medium'),
      utm_campaign: getParam('utm_campaign'),
      device: detectDevice(),
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    }
    for (var key in extra) {
      if (Object.prototype.hasOwnProperty.call(extra, key)) payload[key] = extra[key]
    }

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'das_' + eventName, das: payload })

    if (!API_BASE) return
    try {
      fetch(API_BASE + '/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {})
    } catch {
      // ignore network errors — never break the host page
    }
  }

  function findFieldValue(form, patterns) {
    var fields = form.querySelectorAll('input, textarea')
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      var hay = ((f.name || '') + ' ' + (f.id || '') + ' ' + (f.type || '') + ' ' + (f.placeholder || '')).toLowerCase()
      for (var j = 0; j < patterns.length; j++) {
        if (hay.indexOf(patterns[j]) !== -1 && f.value) return f.value
      }
    }
    return null
  }

  function onFormSubmit(e) {
    var form = e.target
    if (!(form instanceof HTMLFormElement)) return
    var name = findFieldValue(form, ['name', 'fname'])
    var phone = findFieldValue(form, ['phone', 'mobile', 'tel'])
    var email = findFieldValue(form, ['email'])
    if (!name && !phone && !email) return
    send('lead_submitted', { name: name, phone: phone, email: email })
  }

  function onClick(e) {
    var link = e.target.closest ? e.target.closest('a[href]') : null
    if (!link) return
    var href = link.getAttribute('href') || ''
    if (href.indexOf('tel:') === 0) {
      send('call_click', { phone: href.replace('tel:', '') })
    } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
      send('whatsapp_click', {})
    }
  }

  document.addEventListener('submit', onFormSubmit, true)
  document.addEventListener('click', onClick, true)

  send('page_view', {})

  window.dasTrack = send
})()
