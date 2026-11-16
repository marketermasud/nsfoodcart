/* ============================================================
   NS Food Cart — ডেটা লেয়ার
   Firebase কনফিগ বসানো থাকলে Firestore ব্যবহার করে,
   না থাকলে ডেমো মোড (localStorage) — যাতে সাইট সাথে সাথে চালিয়ে দেখা যায়।
   ============================================================ */
(function () {
  'use strict';

  var DEFAULTS = {
    name: 'NS Food Cart',
    tagline: 'Fresh Food • Happy Mood',
    logo: '',
    heroImage: '',
    heroTitle: 'গরম গরম তেহারি, সোজা আপনার দরজায়',
    heroText: 'পারখিদিরপুর বাজারে প্রতিদিন টাটকা রান্না। এখান থেকেই অর্ডার দিন, আমরা পৌঁছে দিচ্ছি।',
    announcement: 'হোম ডেলিভারি চলছে — শুধু আটঘরিয়া থানার ভেতরে',
    phone: '01621159842',
    whatsapp: '8801621159842',
    address: 'পারখিদিরপুর বাজার, আটঘরিয়া, পাবনা ৬৬২৩',
    hours: 'প্রতিদিন সকাল ৯টা – রাত ১০টা',
    facebook: 'https://www.facebook.com/nsfoodcart',
    deliveryCharge: 20,
    freeDelivery: false,
    minOrder: 0,
    deliveryNote: 'হোম ডেলিভারি শুধু আটঘরিয়া থানার ভেতরে।',
    bkash: '',
    shopOpen: true,
    closedMessage: 'এখন অর্ডার নেওয়া বন্ধ আছে। একটু পরে আবার চেষ্টা করুন।',
    accent: '#d81f26',
    f1t: 'গরম গরম পরিবেশন', f1d: 'সকালের নাস্তা থেকে বিকালের ভাজাপোড়া, সবই টাটকা।',
    f2t: 'আটঘরিয়ায় হোম ডেলিভারি', f2d: 'অর্ডার দিন, আমরা বাড়িতে পৌঁছে দিই।',
    f3t: 'হাতে পেয়ে টাকা দিন', f3d: 'আগে কোনো টাকা লাগে না, খাবার বুঝে নিয়ে দাম দিন।',
    nowLabel: 'এই মুহূর্তে চলছে',
    trackTitle: 'অর্ডার কোথায় আছে দেখুন',
    trackLead: 'অর্ডার দেওয়ার পর যে নম্বর পেয়েছেন, সেটা লিখুন।',
    about: 'NS Food Cart — পারখিদিরপুর বাজারের ছোট্ট ফুড কার্ট। সকালের নাস্তা থেকে বিকালের ভাজাপোড়া, সবই প্রতিদিন নতুন করে রান্না হয়।'
  };

  // ফেসবুক পেজের মেনু কার্ড থেকে নেওয়া
  var SEED_CATS = [
    { id: 'c-morning', name: 'সকালের নাস্তা', sort: 1, from: 7, to: 12 },
    { id: 'c-lunch', name: 'দুপুরের খাবার', sort: 2, from: 12, to: 16 },
    { id: 'c-evening', name: 'বিকালের নাস্তা', sort: 3, from: 16, to: 23 },
    { id: 'c-juice', name: 'জুস আইটেম', sort: 4, from: null, to: null }
  ];
  function P(id, cat, sort, name, price, desc, featured) {
    return { id: id, category: cat, sort: sort, name: name, price: price, oldPrice: 0, desc: desc || '', image: '', available: true, featured: !!featured };
  }
  var SEED_PRODUCTS = [
    P('p-ruti', 'c-morning', 1, 'রুটি', 10, 'প্রতি পিস'),
    P('p-aluvaji', 'c-morning', 2, 'আলু ভাজি', 10),
    P('p-murgi', 'c-morning', 3, 'ব্রয়লার মুরগির মাংস', 40),
    P('p-khichuri', 'c-morning', 4, 'খিচুড়ি', 30),
    P('p-ctehari', 'c-lunch', 1, 'চিকেন তেহারি', 70),
    P('p-btehari', 'c-lunch', 2, 'বিফ তেহারি রেগুলার', 100, '', true),
    P('p-btehari-s', 'c-lunch', 3, 'বিফ তেহারি স্পেশাল', 150, '', true),
    P('p-borhani', 'c-lunch', 4, 'বোরহানি', 30, 'প্রতি গ্লাস'),
    P('p-ffry', 'c-evening', 1, 'ফ্রেঞ্চ ফ্রাই', 50, '', true),
    P('p-cfry', 'c-evening', 2, 'চিকেন ফ্রাই', 70),
    P('p-noodles', 'c-evening', 3, 'নুডলস', 30),
    P('p-hdim', 'c-evening', 4, 'হাঁসের ডিম সিদ্ধ স্পেশাল', 25),
    P('p-mdim', 'c-evening', 5, 'মুরগির ডিম সিদ্ধ স্পেশাল', 20),
    P('p-lemon', 'c-juice', 1, 'লেমন জুস', 30),
    P('p-apple', 'c-juice', 2, 'আপেল জুস', 60),
    P('p-malta', 'c-juice', 3, 'মাল্টা জুস', 70)
  ];

  var STATUS = {
    pending: 'অর্ডার পেয়েছি',
    confirmed: 'কনফার্ম হয়েছে',
    preparing: 'রেডি হচ্ছে',
    ontheway: 'রাস্তায় আছে',
    delivered: 'পৌঁছে গেছে',
    cancelled: 'বাতিল'
  };
  var FLOW = ['pending', 'confirmed', 'preparing', 'ontheway', 'delivered'];

  function statusLabel(st, type) {
    if (type === 'pickup' && st === 'ontheway') return 'রেডি, নিয়ে যান';
    if (type === 'pickup' && st === 'delivered') return 'বুঝে নিয়েছেন';
    return STATUS[st] || st;
  }
  function bySort(a, b) { return (Number(a.sort) || 0) - (Number(b.sort) || 0) || String(a.name || '').localeCompare(String(b.name || '')); }
  function genNo() { return 'NS-' + String(Math.floor(100000 + Math.random() * 900000)); }
  function normNo(s) {
    var bn = '০১২৩৪৫৬৭৮৯';
    s = String(s || '').trim().toUpperCase().replace(/[০-৯]/g, function (d) { return bn.indexOf(d); }).replace(/\s+/g, '');
    var digits = s.replace(/\D/g, '');
    return digits.length === 6 ? 'NS-' + digits : s;
  }
  function publicPart(o) {
    return {
      orderNo: o.orderNo, status: o.status, type: o.type,
      items: o.items.map(function (i) { return { name: i.name, qty: i.qty, price: i.price }; }),
      subtotal: o.subtotal, delivery: o.delivery, total: o.total,
      createdAt: o.createdAt, updatedAt: o.createdAt, history: o.history
    };
  }

  function pubPatch(data, now) {
    return {
      items: data.items.map(function (i) { return { name: i.name, qty: i.qty, price: i.price }; }),
      subtotal: data.subtotal, delivery: data.delivery, total: data.total, type: data.type, updatedAt: now
    };
  }

  var cfg = window.FIREBASE_CONFIG || {};
  var useFb = !!(cfg.apiKey && !/^YOUR_/.test(cfg.apiKey) && window.firebase);
  var Store;

  /* ------------------------- Firebase ------------------------- */
  if (useFb) {
    firebase.initializeApp(cfg);
    var db = firebase.firestore();
    var FV = firebase.firestore.FieldValue;
    var col = function (name, cb) {
      return db.collection(name).onSnapshot(function (s) {
        cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }).sort(bySort));
      }, function (e) { console.error(name, e); cb([]); });
    };
    // Firestore খালি থাকলে (প্রথমবার কানেক্ট করার পর) ফেসবুক পেজের মেনুটাই দেখায়,
    // যতক্ষণ না অ্যাডমিন প্রথম লগইনে সেটা Firestore-এ সেভ হয় (settings/site.seeded = true)
    var seeded = null, held = {}, SEEDS = { categories: SEED_CATS, products: SEED_PRODUCTS };
    var flush = function (name) {
      var h = held[name]; if (!h || !h.got || seeded === null) return;
      h.cb(!h.list.length && !seeded ? SEEDS[name].slice().sort(bySort) : h.list);
    };
    db.doc('settings/site').onSnapshot(function (s) { seeded = !!((s.data() || {}).seeded); flush('categories'); flush('products'); },
      function () { seeded = false; flush('categories'); flush('products'); });
    var colSeed = function (name, cb) {
      held[name] = { cb: cb, list: [], got: false };
      return col(name, function (l) { held[name].list = l; held[name].got = true; flush(name); });
    };
    Store = {
      mode: 'firebase',
      watchSettings: function (cb) {
        return db.doc('settings/site').onSnapshot(function (s) { cb(Object.assign({}, DEFAULTS, s.data() || {})); },
          function (e) { console.error(e); cb(Object.assign({}, DEFAULTS)); });
      },
      saveSettings: function (data) { return db.doc('settings/site').set(data, { merge: true }); },
      watchCategories: function (cb) { return colSeed('categories', cb); },
      watchProducts: function (cb) { return colSeed('products', cb); },
      watchSlides: function (cb) { return col('slides', cb); },
      watchReviews: function (cb) {
        return db.collection('reviews').orderBy('createdAt', 'desc').limit(600).onSnapshot(function (s) {
          cb(s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }));
        }, function (e) { console.error('reviews', e); cb([]); });
      },
      save: function (name, id, data) {
        return id ? db.collection(name).doc(id).set(data, { merge: true }) : db.collection(name).add(data);
      },
      remove: function (name, id) { return db.collection(name).doc(id).delete(); },
      placeOrder: async function (order) {
        var lastErr;
        for (var i = 0; i < 4; i++) {
          var no = genNo();
          var o = Object.assign({}, order, { orderNo: no });
          var b = db.batch();
          b.set(db.doc('orders/' + no), o);
          b.set(db.doc('tracking/' + no), publicPart(o));
          try { await b.commit(); return no; } catch (e) { lastErr = e; if (e.code !== 'permission-denied') break; }
        }
        throw lastErr;
      },
      watchTracking: function (no, cb) {
        return db.doc('tracking/' + no).onSnapshot(function (s) { cb(s.exists ? s.data() : null); }, function () { cb(null); });
      },
      watchOrders: function (cb, onErr) {
        return db.collection('orders').orderBy('createdAt', 'desc').limit(400).onSnapshot(function (s) {
          cb(s.docs.map(function (d) { return d.data(); }));
        }, function (e) { console.error(e); if (onErr) onErr(e); });
      },
      setStatus: function (no, status) {
        var now = Date.now(), b = db.batch();
        var upd = { status: status, updatedAt: now, history: FV.arrayUnion({ status: status, at: now }) };
        b.update(db.doc('orders/' + no), upd);
        b.set(db.doc('tracking/' + no), upd, { merge: true });
        return b.commit();
      },
      updateOrder: function (no, data) {
        var now = Date.now(), b = db.batch();
        b.update(db.doc('orders/' + no), Object.assign({ updatedAt: now }, data));
        b.set(db.doc('tracking/' + no), pubPatch(data, now), { merge: true });
        return b.commit().then(function () { return no; });
      },
      deleteOrder: function (no) {
        var b = db.batch(); b.delete(db.doc('orders/' + no)); b.delete(db.doc('tracking/' + no)); return b.commit();
      },
      seed: function () {
        var b = db.batch();
        SEED_CATS.forEach(function (c) { var d = Object.assign({}, c); delete d.id; b.set(db.doc('categories/' + c.id), d); });
        SEED_PRODUCTS.forEach(function (p) { var d = Object.assign({}, p); delete d.id; b.set(db.doc('products/' + p.id), d); });
        b.set(db.doc('settings/site'), { seeded: true }, { merge: true });
        return b.commit();
      },
      // অ্যাডমিন প্রথমবার লগইন করলে খালি ডেটাবেসে মেনুটা নিজে থেকে সেভ করে দেয়
      ensureSeed: async function () {
        var st = await db.doc('settings/site').get();
        if ((st.data() || {}).seeded) return false;
        var p = await db.collection('products').limit(1).get();
        if (p.empty) { await Store.seed(); return true; }
        await db.doc('settings/site').set({ seeded: true }, { merge: true });
        return false;
      },
      onAuth: function (cb) { return firebase.auth().onAuthStateChanged(cb); },
      signIn: function (email, pass) { return firebase.auth().signInWithEmailAndPassword(email, pass); },
      signOut: function () { return firebase.auth().signOut(); }
    };
  }

  /* ------------------------- ডেমো মোড ------------------------- */
  else {
    var KEY = 'nsfc_demo_v1', AUTH = 'nsfc_demo_auth';
    var subs = [];
    var read = function () {
      try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.products) { d.slides = d.slides || []; d.reviews = d.reviews || []; return d; } } catch (e) {}
      var fresh = { settings: {}, categories: SEED_CATS.slice(), products: SEED_PRODUCTS.slice(), slides: [], reviews: [], orders: {}, tracking: {} };
      try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) {}
      return fresh;
    };
    var write = function (d) {
      try { localStorage.setItem(KEY, JSON.stringify(d)); }
      catch (e) { throw new Error('ব্রাউজারের জায়গা শেষ। ছবি ছোট করুন অথবা Firebase কানেক্ট করুন।'); }
      emit();
    };
    var emit = function () { subs.slice().forEach(function (f) { try { f(read()); } catch (e) { console.error(e); } }); };
    var sub = function (pick, cb) {
      var f = function (d) { cb(pick(d)); };
      subs.push(f); setTimeout(function () { if (subs.indexOf(f) > -1) f(read()); }, 0);
      return function () { subs = subs.filter(function (x) { return x !== f; }); };
    };
    window.addEventListener('storage', function (e) { if (e.key === KEY) emit(); });
    var authSubs = [];
    var authUser = function () { return localStorage.getItem(AUTH) ? { email: 'demo@nsfoodcart' } : null; };
    var ok = function (v) { return Promise.resolve(v); };
    var listName = function (n) { return n === 'categories' || n === 'slides' || n === 'reviews' ? n : 'products'; };

    Store = {
      mode: 'demo',
      watchSettings: function (cb) { return sub(function (d) { return Object.assign({}, DEFAULTS, d.settings); }, cb); },
      saveSettings: function (data) { var d = read(); d.settings = Object.assign({}, d.settings, data); write(d); return ok(); },
      watchCategories: function (cb) { return sub(function (d) { return d.categories.slice().sort(bySort); }, cb); },
      watchProducts: function (cb) { return sub(function (d) { return d.products.slice().sort(bySort); }, cb); },
      watchSlides: function (cb) { return sub(function (d) { return d.slides.slice().sort(bySort); }, cb); },
      watchReviews: function (cb) { return sub(function (d) { return d.reviews.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }); }, cb); },
      save: function (name, id, data) {
        var d = read(), list = d[listName(name)];
        if (id) { var i = list.findIndex(function (x) { return x.id === id; }); if (i > -1) list[i] = Object.assign({}, list[i], data); }
        else list.push(Object.assign({ id: 'x' + Date.now().toString(36) }, data));
        try { write(d); } catch (e) { return Promise.reject(e); }
        return ok();
      },
      remove: function (name, id) {
        var d = read(), k = listName(name);
        d[k] = d[k].filter(function (x) { return x.id !== id; });
        try { write(d); } catch (e) { return Promise.reject(e); }
        return ok();
      },
      placeOrder: function (order) {
        var d = read(), no = genNo();
        while (d.orders[no]) no = genNo();
        var o = Object.assign({}, order, { orderNo: no });
        d.orders[no] = o; d.tracking[no] = publicPart(o); write(d); return ok(no);
      },
      watchTracking: function (no, cb) { return sub(function (d) { return d.tracking[no] || null; }, cb); },
      watchOrders: function (cb) {
        return sub(function (d) {
          return Object.keys(d.orders).map(function (k) { return d.orders[k]; }).sort(function (a, b) { return b.createdAt - a.createdAt; });
        }, cb);
      },
      setStatus: function (no, status) {
        var d = read(), now = Date.now();
        [d.orders[no], d.tracking[no]].forEach(function (o) {
          if (!o) return; o.status = status; o.updatedAt = now; o.history = (o.history || []).concat([{ status: status, at: now }]);
        });
        write(d); return ok();
      },
      updateOrder: function (no, data) {
        var d = read(), now = Date.now();
        if (d.orders[no]) Object.assign(d.orders[no], data, { updatedAt: now });
        if (d.tracking[no]) Object.assign(d.tracking[no], pubPatch(data, now));
        write(d); return ok(no);
      },
      deleteOrder: function (no) { var d = read(); delete d.orders[no]; delete d.tracking[no]; write(d); return ok(); },
      seed: function () { var d = read(); d.categories = SEED_CATS.slice(); d.products = SEED_PRODUCTS.slice(); write(d); return ok(); },
      onAuth: function (cb) { authSubs.push(cb); setTimeout(function () { cb(authUser()); }, 0); },
      signIn: function (email, pass) {
        if (pass !== 'demo1234') return Promise.reject(new Error('ডেমো মোডের পাসওয়ার্ড: demo1234'));
        localStorage.setItem(AUTH, '1'); authSubs.forEach(function (f) { f(authUser()); }); return ok();
      },
      signOut: function () { localStorage.removeItem(AUTH); authSubs.forEach(function (f) { f(null); }); return ok(); }
    };
  }

  /* ------------------------- সবার জন্য হেল্পার ------------------------- */
  Store.defaults = DEFAULTS;
  Store.DEMO_LOGIN = { email: 'admin@nsfoodcart.com', pass: 'demo1234' };
  Store.STATUS = STATUS;
  Store.FLOW = FLOW;
  Store.statusLabel = statusLabel;
  Store.normNo = normNo;
  Store.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  Store.bn = function (n) { return Number(n || 0).toLocaleString('bn-BD'); };
  Store.tk = function (n) { return '৳' + Store.bn(n); };
  Store.fullTime = function (ts) {
    return new Date(ts).toLocaleString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };
  Store.time = function (ts) {
    return new Date(ts).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  };
  // ক্যাটাগরিটা এই মুহূর্তে "চলছে" কি না
  Store.isNow = function (c) {
    if (c.from == null || c.to == null || c.from === '' || c.to === '') return false;
    var h = new Date().getHours(), f = Number(c.from), t = Number(c.to);
    return f <= t ? (h >= f && h < t) : (h >= f || h < t);
  };
  // ছবি ছোট করে data URL বানায় (Firebase Storage লাগে না)
  Store.shrinkImage = function (file, max, type) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var r = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL(type || 'image/jpeg', 0.72));
      };
      img.onerror = function () { rej(new Error('ছবিটা পড়া যায়নি')); };
      img.src = url;
    });
  };

  window.Store = Store;
})();
