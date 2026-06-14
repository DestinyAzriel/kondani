<template>
  <div class="lp">
    <!-- NAV -->
    <nav class="nav">
      <div class="nav-in">
        <div class="logo-row">
          <KondaniMark :size="36" />
          <b>Kondani</b>
        </div>
        <div class="nav-r">
          <a class="link" href="#how" @click.prevent="scrollTo('how')">How it works</a>
          <a class="link" href="#stories" @click.prevent="scrollTo('stories')">Stories</a>
          <router-link class="link signin" to="/login">Sign in</router-link>
          <router-link class="nav-cta" to="/login">Create account</router-link>
        </div>
      </div>
    </nav>

    <!-- HERO -->
    <header class="hero">
      <div class="bg"><img :src="img('photo-1719179542047-a4d84fd35c1f', 1600)" alt="" /></div>
      <div class="scrim"></div><div class="scrim2"></div>
      <div class="hero-content">
        <div class="wrap">
          <div class="pill"><span class="dot"></span>🇲🇼 Malawi's home for real connection</div>
          <h1 class="hero-h">Find <em>love</em> in the<br />warm heart of Africa.</h1>
          <p class="sub">Kondani means <strong>love</strong>. Verified Malawians, real plans, real meetups — not endless swiping.</p>
          <div class="ctas">
            <router-link to="/login" class="btn btn-gold">Create account</router-link>
            <a href="#how" @click.prevent="scrollTo('how')" class="btn btn-ghost">How it works</a>
          </div>
          <p class="disclaimer">Every member is selfie-verified.</p>
        </div>
      </div>
    </header>

    <!-- MISSION -->
    <section class="mission">
      <div class="wrap mission-grid">
        <div>
          <div class="k">Our approach</div>
          <h2>Kondani means <em>love</em>.</h2>
          <p>We built Kondani for how Malawians actually meet — coffee in City Centre, a hike up Mulanje, Afrobeats on a Friday night. Not to keep you scrolling, but to get you onto a real date.</p>
          <p>Every profile is verified with a live selfie, so the person you meet is the person you matched with. No catfish, no bots — just real people, near you.</p>
        </div>
        <div class="photo"><img :src="img('photo-1633653330687-9955a3796b8c', 900)" alt="" /></div>
      </div>
    </section>

    <!-- HOW -->
    <section class="how" id="how">
      <div class="wrap">
        <div class="head"><h2>From hello to a real date</h2><p>Set up in under two minutes, then meet someone this week.</p></div>
        <div class="how-grid">
          <div class="how-card"><div class="step-img"><img :src="img('photo-1692457799626-4477193123c6', 700)" /><div class="iscr"></div><div class="n">1</div></div><h3>Create your profile</h3><p>Sign up with your phone, add real photos and what you love. Quick and painless.</p></div>
          <div class="how-card"><div class="step-img"><img :src="img('photo-1585962673804-d92fd4eac3c8', 700)" /><div class="iscr"></div><div class="n">2</div></div><h3>Get your gold badge</h3><p>One live selfie verifies you're real. Verified members get 4× more matches.</p></div>
          <div class="how-card"><div class="step-img"><img :src="img('photo-1626775920385-3f5348cc22f8', 700)" /><div class="iscr"></div><div class="n">3</div></div><h3>Match &amp; meet</h3><p>Swipe, post a plan, or get daily picks — then chat, call, and meet for real.</p></div>
        </div>
      </div>
    </section>

    <!-- STORIES -->
    <section class="stories" id="stories">
      <div class="wrap">
        <div class="head"><div class="k center">Kondani stories</div><h2>Real matches, real meetups</h2></div>

        <div class="story">
          <div class="ph"><img :src="img('photo-1633653331665-6397dceec7ae', 1000)" /></div>
          <div>
            <div class="stars">★★★★★</div>
            <blockquote>“I posted a coffee plan at Mamma Mia and Grace joined. Six months later, we still meet for coffee every weekend.”</blockquote>
            <div class="by"><img :src="img('photo-1575467678950-0c09aad418af', 120)" /><div><div class="nm">Daniel &amp; Grace</div><div class="ct">Lilongwe</div></div></div>
          </div>
        </div>

        <div class="story rev">
          <div class="ph"><img :src="img('photo-1619010539735-92149716db70', 1000)" /></div>
          <div>
            <div class="stars">★★★★★</div>
            <blockquote>“Everyone's verified, so it actually felt safe. We matched, video-called that night, and hiked Mulanje that weekend.”</blockquote>
            <div class="by"><img :src="img('photo-1592599457638-3ae7ccfbe065', 120)" /><div><div class="nm">Thoko &amp; Kondwani</div><div class="ct">Blantyre</div></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats">
      <div class="stats-grid">
        <div class="stat"><div class="v">Verified</div><div class="l">Every single member</div></div>
        <div class="stat"><div class="v">4 cities</div><div class="l">Lilongwe · Blantyre · Mzuzu · Zomba</div></div>
        <div class="stat"><div class="v">0</div><div class="l">Bots, ever</div></div>
      </div>
    </section>

    <!-- CLOSING -->
    <section class="closing">
      <div class="bg"><img :src="img('photo-1633653330768-3e869a81eff8', 1600)" /></div>
      <div class="scrim"></div>
      <div class="inner wrap">
        <h2>Your person is out there.</h2>
        <p>Join verified Malawians finding real <em>love</em>. Free to start.</p>
        <router-link to="/login" class="btn btn-gold">Create account</router-link>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="foot">
        <div class="logo-row"><KondaniMark :size="30" /><b>Kondani</b></div>
        <div class="foot-links">
          <router-link to="/privacy">Privacy</router-link>
          <router-link to="/safety-center">Safety</router-link>
          <router-link to="/support">Support</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import KondaniMark from '@/components/ui/KondaniMark.vue'

const img = (id, w) => `https://images.unsplash.com/${id}?w=${w}&q=80&fit=crop`
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
</script>

<style scoped>
.lp{background:#050d12;color:#f1f8f6;overflow-x:hidden;font-family:'Inter',sans-serif;}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-weight:700;border:none;cursor:pointer;text-decoration:none;transition:transform .15s;}
.btn:hover{transform:translateY(-2px);}
.btn-gold{background:linear-gradient(95deg,#d99a1f,#f4b740 50%,#ffd98a);color:#1a1205;border-radius:99px;padding:15px 32px;font-size:16px;box-shadow:0 12px 30px rgba(244,183,64,.4);}
.btn-ghost{background:rgba(255,255,255,.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:99px;padding:15px 30px;font-size:16px;font-weight:600;}
.logo-row{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.logo-row b{font-family:'Outfit',sans-serif;font-size:23px;font-weight:800;letter-spacing:-.02em;color:#fff;}

.nav{position:absolute;top:0;left:0;right:0;z-index:20;}
.nav-in{max-width:1180px;margin:0 auto;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;}
.nav-r{display:flex;align-items:center;gap:18px;}
.nav-r a.link{color:#fff;text-decoration:none;font-weight:600;font-size:15px;opacity:.92;white-space:nowrap;}
.nav-r a.link:hover{color:#ffd98a;}
.nav-cta{background:#fff;color:#050d12;border-radius:99px;padding:11px 24px;font-weight:700;text-decoration:none;font-size:15px;white-space:nowrap;}

.hero{position:relative;height:100vh;min-height:680px;max-height:940px;display:flex;align-items:flex-end;}
.hero .bg{position:absolute;inset:0;z-index:0;}
.hero .bg img{width:100%;height:100%;object-fit:cover;object-position:center 25%;}
.scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(5,13,18,.75) 0%,rgba(5,13,18,.25) 30%,rgba(5,13,18,.65) 68%,rgba(5,13,18,.99) 100%);}
.scrim2{position:absolute;inset:0;z-index:1;background:radial-gradient(75% 70% at 18% 88%,rgba(5,13,18,.85),transparent 72%);}
.hero-content{position:relative;z-index:5;padding-bottom:84px;width:100%;}
.pill{display:inline-flex;align-items:center;gap:8px;background:rgba(244,183,64,.16);backdrop-filter:blur(8px);border:1px solid rgba(244,183,64,.4);color:#ffd98a;font-size:13px;font-weight:600;padding:8px 16px;border-radius:99px;margin-bottom:24px;}
.pill .dot{width:7px;height:7px;border-radius:50%;background:#f4b740;}
.hero-h{font-family:'Fraunces',serif;font-weight:600;font-size:78px;line-height:1;letter-spacing:-.025em;color:#fff;max-width:900px;margin-bottom:24px;text-shadow:0 2px 30px rgba(0,0,0,.4);}
.hero-h em{font-style:italic;color:#ffd98a;}
.hero .sub{font-size:21px;color:rgba(255,255,255,.88);max-width:540px;line-height:1.5;margin-bottom:32px;}
.hero .ctas{display:flex;gap:14px;flex-wrap:wrap;align-items:center;}
.disclaimer{margin-top:26px;font-size:12px;color:rgba(255,255,255,.5);}

.mission{padding:120px 0;background:linear-gradient(180deg,#050d12,#0a1820);}
.mission-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.k{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#f4b740;margin-bottom:18px;}
.k.center{text-align:center;}
.mission h2{font-family:'Fraunces',serif;font-weight:600;font-size:50px;line-height:1.05;letter-spacing:-.02em;margin-bottom:22px;}
.mission h2 em,.closing h2 em{font-style:italic;color:#ffd98a;}
.mission p{color:rgba(241,248,246,.6);font-size:17px;line-height:1.75;margin-bottom:16px;}
.mission .photo{border-radius:26px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 50px 90px -30px rgba(0,0,0,.85);border:1px solid rgba(255,255,255,.09);}
.mission .photo img{width:100%;height:100%;object-fit:cover;}

.how{padding:100px 0;background:#0a1820;}
.how .head{text-align:center;max-width:620px;margin:0 auto 58px;}
.how .head h2{font-family:'Outfit',sans-serif;font-weight:800;font-size:42px;letter-spacing:-.02em;margin-bottom:12px;}
.how .head p{color:rgba(241,248,246,.6);font-size:16px;}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
.how-card .step-img{border-radius:22px;overflow:hidden;aspect-ratio:5/4;margin-bottom:20px;position:relative;border:1px solid rgba(255,255,255,.09);}
.how-card .step-img img{width:100%;height:100%;object-fit:cover;}
.how-card .step-img .iscr{position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(5,13,18,.5));}
.how-card .step-img .n{position:absolute;top:14px;left:14px;width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#ffd98a,#f4b740);color:#1a1205;font-family:'Outfit',sans-serif;font-weight:800;display:flex;align-items:center;justify-content:center;}
.how-card h3{font-family:'Outfit',sans-serif;font-weight:700;font-size:21px;margin-bottom:8px;}
.how-card p{color:rgba(241,248,246,.6);font-size:14.5px;line-height:1.6;}

.stories{padding:120px 0;background:linear-gradient(180deg,#0a1820,#050d12);}
.stories .head{text-align:center;max-width:620px;margin:0 auto 66px;}
.stories .head h2{font-family:'Fraunces',serif;font-weight:600;font-size:50px;letter-spacing:-.02em;}
.story{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin-bottom:84px;}
.story:last-child{margin-bottom:0;}
.story.rev .ph{order:2;}
.story .ph{border-radius:26px;overflow:hidden;aspect-ratio:4/3;box-shadow:0 50px 90px -30px rgba(0,0,0,.85);border:1px solid rgba(255,255,255,.09);}
.story .ph img{width:100%;height:100%;object-fit:cover;}
.story .stars{color:#f4b740;letter-spacing:4px;margin-bottom:18px;font-size:16px;}
.story blockquote{font-family:'Fraunces',serif;font-weight:500;font-size:28px;line-height:1.38;color:#fff;margin-bottom:22px;}
.story .by{display:flex;align-items:center;gap:12px;}
.story .by img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #f4b740;}
.story .by .nm{font-weight:700;font-size:15px;}
.story .by .ct{color:rgba(241,248,246,.4);font-size:13px;}

.stats{padding:72px 0;border-top:1px solid rgba(255,255,255,.09);border-bottom:1px solid rgba(255,255,255,.09);background:#03080b;}
.stats-grid{display:flex;justify-content:center;gap:72px;flex-wrap:wrap;text-align:center;}
.stat .v{font-family:'Outfit',sans-serif;font-weight:800;font-size:44px;background:linear-gradient(120deg,#ffd98a,#f4b740);-webkit-background-clip:text;background-clip:text;color:transparent;}
.stat .l{color:rgba(241,248,246,.6);font-size:14px;margin-top:4px;}

.closing{position:relative;padding:150px 0;text-align:center;overflow:hidden;}
.closing .bg{position:absolute;inset:0;z-index:0;}
.closing .bg img{width:100%;height:100%;object-fit:cover;object-position:center 30%;}
.closing .scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(5,13,18,.82),rgba(5,13,18,.95));}
.closing .inner{position:relative;z-index:5;}
.closing h2{font-family:'Fraunces',serif;font-weight:600;font-size:58px;line-height:1.04;letter-spacing:-.02em;margin-bottom:18px;}
.closing p{color:rgba(255,255,255,.82);font-size:19px;margin-bottom:34px;}

.footer{background:#03080b;border-top:1px solid rgba(255,255,255,.09);}
.foot{max-width:1180px;margin:0 auto;padding:46px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}
.foot-links a{color:rgba(241,248,246,.6);text-decoration:none;font-size:14px;margin-left:26px;}
.foot-links a:hover{color:#ffd98a;}

@media(max-width:880px){
  .hero{min-height:600px;}
  .hero-h{font-size:46px;} .hero .sub{font-size:17px;}
  .mission,.how,.stories{padding:72px 0;} .closing{padding:100px 0;}
  .mission-grid,.how-grid,.story{grid-template-columns:1fr;gap:32px;}
  .story.rev .ph{order:0;}
  .nav-r .link:not(.signin):not(.nav-cta){display:none;}
  .closing h2{font-size:38px;} .stats-grid{gap:36px;}
  .mission h2,.stories .head h2{font-size:34px;} .how .head h2{font-size:30px;}
  .mission .photo{aspect-ratio:4/3;}
}
@media(max-width:560px){
  .wrap{padding:0 20px;}
  .nav-in{padding:14px 20px;}
  .logo-row b{font-size:19px;}
  .nav-r{gap:12px;}
  .nav-r a.link.signin{display:none;} /* declutter: Create account covers sign-in (same screen) */
  .nav-cta{padding:10px 18px;font-size:14px;}
  .hero{min-height:560px;height:auto;padding-top:120px;}
  .hero-content{padding-bottom:52px;}
  .pill{font-size:12px;padding:7px 13px;margin-bottom:18px;}
  .hero-h{font-size:34px;line-height:1.06;margin-bottom:16px;}
  .hero .sub{font-size:15.5px;margin-bottom:24px;}
  .ctas{gap:10px;}
  .ctas .btn{flex:1 1 100%;padding:14px;font-size:15px;}
  .mission,.how,.stories{padding:56px 0;} .closing{padding:80px 0;}
  .k{margin-bottom:12px;}
  .mission h2,.stories .head h2,.closing h2{font-size:28px;}
  .how .head h2{font-size:26px;}
  .mission p{font-size:15.5px;}
  .story{gap:22px;margin-bottom:48px;}
  .story blockquote{font-size:21px;}
  .story .ph,.mission .photo{aspect-ratio:4/3;}
  .how-card .step-img{aspect-ratio:16/10;}
  .stat .v{font-size:34px;} .stats-grid{gap:26px;} .stats{padding:48px 0;}
}
</style>
