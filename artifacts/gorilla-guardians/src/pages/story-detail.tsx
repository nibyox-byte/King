import { useRoute, Link } from "wouter";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetStory, getGetStoryQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const DEMO_STORIES: Record<number, any> = {
  1: { id: 1, title: "From Poacher to Protector: Emmanuel's Journey", type: "artisan", excerpt: "Emmanuel Nkurunziza once entered the forest to hunt. Today, he carves gorilla sculptures that fund the very conservation efforts he once threatened.", content: "Twenty years ago, Emmanuel Nkurunziza walked into Volcanoes National Park with a snare in his hand and desperate hunger in his belly. His family had nothing. The forest seemed like the only answer.\n\nToday, Emmanuel walks the same forest paths as a conservation guide, his hands now shaped not by desperation but by artistry. His wood carvings — especially his gorilla family sculptures — are sold in galleries across three continents.\n\nThe transformation began when the Gorilla Guardians program offered Emmanuel a choice: learn a craft, earn an income, become a guardian. He chose woodcarving, a skill he'd glimpsed in his grandfather's hands.\n\n\"The gorillas give me my life now,\" Emmanuel says, smoothing beeswax into a freshly carved sculpture. \"If they disappear, so does everything I've built.\" He is one of 85 conservation ambassadors in the Musanze community — former threats to the park who are now its most passionate defenders.", coverImage: null, tags: ["conservation", "artisan", "transformation"], createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), published: true },
  2: { id: 2, title: "The Language of Baskets: Agaseke and the Art of Peace", type: "culture", excerpt: "For centuries, the Agaseke peace basket has carried messages that words cannot express. Master weaver Celestine Mukamana explains the grammar of her art.", content: "Every Agaseke basket tells a story. The colors, the patterns, the density of the weave — all carry meaning in a visual language developed over centuries by Rwandan women.\n\nCelestine Mukamana has been reading and writing this language since she was seven years old, sitting at her grandmother's feet in Musanze. Today at 44, she teaches it to 15 young women in her village workshop.\n\n\"The sunrise pattern means new beginnings,\" she explains, her fingers moving with impossible speed through the sisal. \"The zigzag is the path of life — never straight, always moving forward. When you give someone an Agaseke basket, you are giving them a blessing woven by your own hands.\"\n\nThe Agaseke is Rwanda's national symbol, featured on official ceremonies and given as gifts to heads of state. Through Gorilla Guardians Village, Celestine's baskets now carry their blessings to homes in 47 countries.", coverImage: null, tags: ["culture", "craft", "tradition", "baskets"], createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), published: true },
  3: { id: 3, title: "Imigongo: The World's Oldest Geometric Art Tradition", type: "culture", excerpt: "Long before the Bauhaus movement declared 'form follows function', Rwandan women were painting perfect geometric patterns on the walls of their homes.", content: "Imigongo is believed to be one of the oldest continuous art traditions in the world. For at least 400 years — possibly much longer — Rwandan women have been creating intricate geometric patterns using natural earth pigments and an unlikely medium: cow dung.\n\nThe process is as precise as it is poetic. The base is a mixture of ash and dung, smoothed onto a surface and allowed to dry until it forms a hard, crack-resistant canvas. Then the patterns are carved in relief and painted with pigments ground from volcanic soil — black from ash, white from chalk, red from clay, green from malachite.\n\nAlphonsine Umubyeyi, 58 years old and internationally recognized for her Imigongo work, describes the patterns as a visual philosophy. \"Each shape has a meaning. The triangle is the mountain — stability, home. The spiral is time — everything comes back around. When you put them together, you are writing something true about the world.\"\n\nAlphonsine exhibits globally, but her greatest pride is her workshop in Musanze, where 40 women now earn their living from this ancient art.", coverImage: null, tags: ["imigongo", "art", "culture", "history"], createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), published: true },
};

export default function StoryDetailPage() {
  const [, params] = useRoute("/stories/:id");
  const id = Number(params?.id);
  const { data: story, isLoading } = useGetStory(id, { query: { enabled: !!id, queryKey: getGetStoryQueryKey(id) } });
  const resolvedStory = (story as any) ?? DEMO_STORIES[id] ?? null;
  const s = resolvedStory;

  if (isLoading && !resolvedStory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="aspect-video bg-muted rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-muted rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!resolvedStory) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Story not found</h2>
          <Link href="/stories"><Button>Back to Stories</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/stories" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Stories
        </Link>
        <div className="mb-6">
          <Badge className={`capitalize mb-4 ${
            s.type === "artisan" ? "bg-green-100 text-green-800" :
            s.type === "culture" ? "bg-blue-100 text-blue-800" :
            "bg-primary/10 text-primary"
          }`}>{s.type}</Badge>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4 leading-tight">{s.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(s.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        {/* Cover image */}
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl overflow-hidden mb-8">
          {s.coverImage ? (
            <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center imigongo-pattern">
              <BookOpen className="w-16 h-16 text-primary/30" />
            </div>
          )}
        </div>

        {/* Lead text */}
        <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary/40 pl-4 italic">{s.excerpt}</p>

        {/* Content */}
        <div className="prose prose-neutral max-w-none">
          {s.content?.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="mb-6 leading-relaxed text-foreground/80">{paragraph}</p>
          ))}
        </div>

        {/* Tags */}
        {s.tags?.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {s.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground mb-4">Enjoyed this story? Support the artisans who inspire it.</p>
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Shop Handcrafted Products</Button>
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
