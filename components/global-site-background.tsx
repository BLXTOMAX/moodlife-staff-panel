"use client";

export default function GlobalSiteBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-50 bg-[#050505]" />

      <div className="fixed inset-0 -z-50 bg-[linear-gradient(135deg,#030303,#090909,#050505)]" />

      <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.08),transparent_28%),radial-gradient(circle_at_right,rgba(250,204,21,0.08),transparent_24%)]" />

      <div className="fixed inset-0 -z-50 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:70px_70px]" />
    </>
  );
}