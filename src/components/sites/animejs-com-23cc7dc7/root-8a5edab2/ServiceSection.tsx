"use client";

import { ArrowUpRight, Building2, Wallet, Wrench } from "lucide-react";
import styles from "./ServiceSection.module.css";

type Service = "room" | "repair" | "bill" | "notice-water" | "notice-safety";

type ServiceSectionProps = {
  onOpen: (service: Service) => void;
  repairCount: number;
};

export function ServiceSection({ onOpen, repairCount }: ServiceSectionProps) {
  const services = [
    { id: "room", number: "01", icon: Building2, title: "我的住宿", detail: "南苑 3 栋 · 502 · 02 床", action: "查看住宿", color: styles.coral },
    { id: "repair", number: "02", icon: Wrench, title: "维修服务", detail: `${repairCount} 条报修记录`, action: "提交报修", color: styles.lime },
    { id: "bill", number: "03", icon: Wallet, title: "账单缴费", detail: "本月待缴 ¥128.60", action: "查看账单", color: styles.lavender },
  ] as const;

  return (
    <>
      <section id="services" className={styles.services} aria-labelledby="services-heading">
        <p className={styles.eyebrow}>01 / CAMPUS SERVICES</p>
        <div className={styles.headingRow}>
          <h2 id="services-heading" className={styles.heading}>你的日常，都有回应。</h2>
          <p className={styles.intro}>住宿、报修、缴费，一处就好。</p>
        </div>
        <div className={styles.cards}>
          {services.map(({ id, number, icon: Icon, title, detail, action, color }) => (
            <button key={id} type="button" className={`${styles.card} ${color}`} onClick={() => onOpen(id)}>
              <span className={styles.cardTop}>
                <Icon size={34} strokeWidth={1.4} aria-hidden="true" />
                <span className={styles.number}>{number}</span>
              </span>
              <span className={styles.cardTitle}>{title}</span>
              <span className={styles.detail}>{detail}</span>
              <span className={styles.action}>{action}<ArrowUpRight size={19} aria-hidden="true" /></span>
            </button>
          ))}
        </div>
      </section>
      <section id="notices" className={styles.notices} aria-labelledby="notices-heading">
        <div className={styles.noticeHeading}>
          <p className={styles.eyebrow}>02 / WHAT’S NEW</p>
          <h2 id="notices-heading">公寓公告</h2>
        </div>
        <div className={styles.noticeList}>
          <button type="button" className={styles.notice} onClick={() => onOpen("notice-water")}>
            <span className={styles.date}>09.21</span>
            <span className={styles.noticeTitle}>南苑 3 栋供水维护通知</span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </button>
          <button type="button" className={styles.notice} onClick={() => onOpen("notice-safety")}>
            <span className={styles.date}>09.18</span>
            <span className={styles.noticeTitle}>秋季宿舍用电安全提醒</span>
            <ArrowUpRight size={21} aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}
