/* main.js — only interactive features. All portfolio content is now plain HTML. */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const nav = $("#nav");
const ham = $("#ham");
if (ham) ham.onclick = () => {
    const open = nav.classList.toggle("open");
    ham.setAttribute("aria-expanded", open);
};

$$("nav a").forEach(a => {
    if (a.href === location.href) a.classList.add("on");
});

addEventListener("scroll", () => {
    const doc = document.documentElement,
        y = scrollY;
    const hd = $("#hd"),
        bar = $("#bar"),
        top = $("#top");
    if (hd) hd.classList.toggle("s", y > 20);
    if (bar) bar.style.width = (y / (doc.scrollHeight - innerHeight || 1) * 100) + "%";
    if (top) top.classList.toggle("on", y > 500);
}, { passive: true });

if ($("#top")) $("#top").onclick = () => scrollTo({ top: 0, behavior: "smooth" });

/* Home photo upload */
const photoBox = $("#ph"),
    photoInput = $("#pf");
if (photoBox && photoInput) {
    const showPhoto = src => {
        const old = $("img", photoBox);
        if (old) old.remove();
        $("#phl").hidden = true;
        const img = new Image();
        img.src = src;
        img.alt = "Praveen S";
        photoBox.appendChild(img);
    };
    try { const saved = localStorage.getItem("portfolioPhoto"); if (saved) showPhoto(saved); } catch (e) {}
    photoInput.onchange = () => {
        const file = photoInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { showPhoto(reader.result); try { localStorage.setItem("portfolioPhoto", reader.result); } catch (e) {} };
        reader.readAsDataURL(file);
    };
    photoBox.onkeydown = e => { if (e.key === "Enter") photoInput.click(); };
}

/* Home 3D hero */
const canvas = $("#gl"),
    stage = $("#stage");
if (canvas && stage && window.THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 50);
    camera.position.z = 6;
    const group = new THREE.Group();
    scene.add(group);
    const wire = (geometry, color, opacity) => {
        const m = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
        group.add(m);
        return m;
    };
    const ball = wire(new THREE.IcosahedronGeometry(2.5, 1), 0x4de1ff, .55);
    const ring = wire(new THREE.TorusGeometry(2.9, .012, 8, 120), 0x8b7bff, .9);
    const outer = wire(new THREE.OctahedronGeometry(3.1, 0), 0x8b7bff, .25);
    ring.rotation.x = 1.2;
    const resize = () => {
        const w = canvas.clientWidth;
        renderer.setSize(w, w, false);
    };
    resize();
    addEventListener("resize", resize);
    let mx = 0,
        my = 0;
    stage.onpointermove = e => {
        const r = stage.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - .5;
        my = (e.clientY - r.top) / r.height - .5;
        if (photoBox) photoBox.style.transform = `translate(${mx*14}px,${my*14}px)`
    };
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const loop = () => {
        requestAnimationFrame(loop);
        if (document.hidden) return;
        const s = reduce ? 0 : .004;
        ball.rotation.y += s;
        ball.rotation.x += s / 2;
        ring.rotation.z += s * 2;
        outer.rotation.y -= s;
        group.rotation.y += (mx * .8 - group.rotation.y) * .05;
        group.rotation.x += (my * .8 - group.rotation.x) * .05;
        renderer.render(scene, camera)
    };
    loop();
}

/* Project + achievement filters */
$$("[data-filter]").forEach(btn => btn.onclick = () => {
    $$("[data-filter]").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    const wanted = btn.dataset.filter;
    $$(".pc").forEach(card => card.style.display = (wanted === "All" || card.dataset.cat.split("|").includes(wanted)) ? "" : "none");
});
$$("[data-achievement]").forEach(btn => btn.onclick = () => {
    $$("[data-achievement]").forEach(b => b.classList.remove("on"));
    btn.classList.add("on");
    const wanted = btn.dataset.achievement;
    $$("#achievements .card").forEach(card => card.style.display = (wanted === "All" || card.dataset.category === wanted) ? "" : "none");
});

/* Project card tilt */
if (matchMedia("(pointer:fine)").matches) {
    $$(".pc").forEach(card => {
        card.onmousemove = e => {
            const r = card.getBoundingClientRect(),
                x = (e.clientX - r.left) / r.width - .5,
                y = (e.clientY - r.top) / r.height - .5;
            card.style.transform = `perspective(900px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-4px)`
        };
        card.onmouseleave = () => card.style.transform = "";
    });
}

/* Contact form */
const form = $("#cf");
if (form) form.onsubmit = e => {
    e.preventDefault();
    const f = form.elements;
    let ok = true;
    const check = (field, msg, passed) => { field.nextElementSibling.textContent = passed ? "" : msg; if (!passed) ok = false };
    check(f.n, "Enter your name.", f.n.value.trim().length > 1);
    check(f.e, "Enter a valid email address.", /^\S+@\S+\.\S+$/.test(f.e.value));
    check(f.s, "Enter a subject.", f.s.value.trim().length > 0);
    check(f.m, "Write at least 10 characters.", f.m.value.trim().length >= 10);
    if (!ok) return;
    location.href = `mailto:your-email@example.com?subject=${encodeURIComponent(f.s.value)}&body=${encodeURIComponent(f.m.value+"\n\n"+f.n.value+" ("+f.e.value+")")}`;
};

/* ============================= */
/* PROJECT IMAGE SLIDER */
/* ============================= */

let currentProjectImage = 0;

const projectImages =
    document.querySelectorAll(".project-image");

const projectDots =
    document.querySelectorAll(".dot");

const currentImage =
    document.getElementById("currentImage");

const totalImages =
    document.getElementById("totalImages");


if (projectImages.length > 0) {

    totalImages.textContent =
        projectImages.length;


    function showProjectImage(index) {

        if (index >= projectImages.length) {
            index = 0;
        }

        if (index < 0) {
            index = projectImages.length - 1;
        }


        projectImages.forEach((image) => {
            image.classList.remove("active");
        });


        projectDots.forEach((dot) => {
            dot.classList.remove("active");
        });


        projectImages[index].classList.add("active");


        if (projectDots[index]) {
            projectDots[index].classList.add("active");
        }


        currentProjectImage = index;


        currentImage.textContent =
            index + 1;
    }


    function changeProjectImage(direction) {

        let nextImage =
            currentProjectImage + direction;

        showProjectImage(nextImage);
    }

}

// Skills page reveal animation
const skillCards = document.querySelectorAll(".skill-card");
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: .2
});
skillCards.forEach(card => observer.observe(card));





const autoSlideImages = document.querySelectorAll(".project-image");
const autoSlideDots = document.querySelectorAll(".dot");

let autoSlideIndex = 0;

function showProjectImage(index) {
    autoSlideImages.forEach(img => {
        img.classList.remove("active");
    });

    autoSlideDots.forEach(dot => {
        dot.classList.remove("active");
    });

    autoSlideIndex = index;

    autoSlideImages[autoSlideIndex].classList.add("active");
    autoSlideDots[autoSlideIndex].classList.add("active");
}

function autoPlayProjectImages() {
    autoSlideIndex++;

    if (autoSlideIndex >= autoSlideImages.length) {
        autoSlideIndex = 0;
    }

    showProjectImage(autoSlideIndex);
}

setInterval(autoPlayProjectImages, 3000);