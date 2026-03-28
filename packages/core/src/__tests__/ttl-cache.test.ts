import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TtlCache } from "../cache/ttl-cache";

describe("TtlCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("set/getで値を保存・取得できる", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("TTL超過後はundefinedを返す", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key1", "value1");

    vi.advanceTimersByTime(1001);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("カスタムTTLを指定できる", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key1", "value1", 5000);

    vi.advanceTimersByTime(3000);
    expect(cache.get("key1")).toBe("value1");

    vi.advanceTimersByTime(2001);
    expect(cache.get("key1")).toBeUndefined();
  });

  it("deleteで値を削除できる", () => {
    const cache = new TtlCache<string>(1000);
    cache.set("key1", "value1");
    cache.delete("key1");
    expect(cache.get("key1")).toBeUndefined();
  });
});
