
export default function Home() {
  return (
      <>
      <section className="relative bg-(--primary) pt-(--spacing-5xl) pb-(--spacing-5xl)">
          <div className="w-full max-w-[1280px] mx-auto">
              <div className="text-center">
                  <h1 className="font-(--font-family-heading) text-4xl mb-(--spacing-lg)" style={{ color: 'var(--primary-foreground)' }}>
                      Welcome to<br />
                      <span className="italic">Oracle of Art</span>
                  </h1>
                  <p className="text-lg max-w-2xl mt-0 mx-auto mb-(--spacing-4xl)" style={{ color: '#f5f5f5e6' }}>
                      Your educational portal to explore art history. 
                      Discover masterpieces, learn about artistic movements 
                      and immerse yourself in centuries of human creativity.
                  </p>
                  <div className="flex items-center justify-center gap-(--spacing-lg) flex-col sm:flex-row">
                      <a href="/gallery" className="font-(--font-family-heading) py-3 px-(--spacing-xl) bg-(--primary-foreground) no-underline inline-block transition-all duration-(--transition-fast) hover:opacity-90" style={{color: 'var(--primary)'}}>
                          View Gallery
                      </a>
                      <a href="/login" className="font-(--font-family-heading) py-3 px-(--spacing-xl) border border-(--primary-foreground) no-underline inline-block transition-all duration-(--transition-fast) hover:bg-[#f5f5f51a]" style={{color: 'var(--primary-foreground)'}}>
                          Sign In
                      </a>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="pt-(--spacing-4xl) pb-(--spacing-4xl)">
          <div className="w-full max-w-[1280px] mx-auto">
              <h2 className="font-(--font-family-heading) text-3xl text-center mb-(--spacing-3xl)">
                  Explore our tools
              </h2>

              <div className="grid grid-cols-1 gap-(--spacing-xl) md:grid-cols-2 lg:grid-cols-3 ">
                  {/* Bucle para recorrer las features */}

                  <a href="#" className="bg-(--card) border border-[#afafaf80] relative no-underline text-inherit block overflow-hidden transition-shadow duration-(--transition-normal) hover:shadow-[0px_8px_30px_#0000001f] group">
                      {/* TODO: Agregar href con el enlace de la feature (feature.enlace) */}
                      <div className="relative w-full pb-[75%] overflow-hidden">
                          <img
                              src="#"
                              alt=""
                              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-(--transition-slow) group-hover:scale-105"
                          />
                          {/* TODO: Agregar src con la ruta de la imagen (feature.imagen) y alt con el título (feature.titulo) */}
                      </div>
                      <div className="p-(--spacing-lg)">
                          <h3 className="font-(--font-family-heading) text-2xl mb-(--spacing-md)">
                              {/* TODO: Agregar título de la feature (feature.titulo) */}
                          </h3>
                          <p className="mb-(--spacing-lg)" style={{color: 'var(--muted-foreground)'}}>
                              {/* TODO: Agregar descripción de la feature (feature.descripcion) */}
                          </p>
                          <span className="inline-block mt-(--spacing-lg) font-(--font-family-heading) no-underline" style={{color: 'var(--primary)'}}>
                              Learn more →
                          </span>
                      </div>
                  </a>
                  {/* Fin del bucle para recorrer las features */}
              </div>
          </div>
      </section>

      {/* About Section */}
      <section className="pt-(--spacing-4xl) pb-(--spacing-4xl) bg-(--card)">
          <div className="w-full max-w-[1280px] mx-auto">
              <div className="max-w-3xl my-0 mx-auto text-center">
                  <h2 className="font-(--font-family-heading) text-3xl mb-(--spacing-xl)">
                      About Oracle of Art
                  </h2>
                  <p className="text-lg leading-relaxed mb-(--spacing-lg)" style={{color:'var(--muted-foreground)'}}>
                      Oracle of Art was born with the mission of bringing the world&apos;s artistic heritage 
                      closer to students, teachers, and art enthusiasts. Our platform combines 
                      academic rigor with modern technology to offer a unique and accessible educational 
                      experience.
                  </p>
                  <p className="text-lg leading-relaxed mb-(--spacing-lg)" style={{color:'var(--muted-foreground)'}}>
                      From the cave paintings of Altamira to the avant-garde of the 20th century, 
                      we invite you to discover the stories behind the works that have defined 
                      humanity&apos;s artistic expression.
                  </p>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="pt-(--spacing-4xl) pb-(--spacing-4xl)">
          <div className="w-full max-w-[1280px] mx-auto">
              <div className="text-center">
                  <h2 className="font-(--font-family-heading) text-3xl mb-(--spacing-lg)">
                      Ready to explore?
                  </h2>
                  <p className="text-lg mb-(--spacing-xl)" style={{color: 'var(--muted-foreground)'}}>
                      Sign up for free and access all platform features.
                  </p>
                  <a href="/register" className="inline-block font-(--font-family-heading) py-(--spacing-md) px-(--spacing-4xl) bg-(--primary) no-underline transition-all duration-(--transition-fast) hover:opacity-90" style={{color:'var(--primary-foreground)'}}>
                      Create free account
                  </a>
              </div>
          </div>
      </section>
      </>
  )
}