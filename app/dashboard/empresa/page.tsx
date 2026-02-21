'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import { requireAdminRole } from '@/lib/role'

interface CompanyData {
  id: string
  user_id: string
  nome_empresa?: string
  tipo_empresa?: string
  telefone?: string
  facebook?: string
  instagram?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  latitude?: string
  longitude?: string
  descricao?: string
  intervalo_grade?: number
  formato_hora?: string
  logo_url?: string
}

interface Horario {
  id: string
  user_id: string
  dia_semana: number // 0 = segunda, 6 = domingo
  hora_inicio: string
  hora_fim: string
  horario_almoco_inicio?: string
  horario_almoco_fim?: string
  ativo: boolean
  created_at: string
}

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const CIDADES_POR_ESTADO: Record<string, string[]> = {
  'AC': ['Acrelândia', 'Brasiléia', 'Cruzeiro do Sul', 'Epitaciolândia', 'Feijó', 'Plácido de Castro', 'Rio Branco', 'Sena Madureira', 'Senador Guiomard', 'Tarauacá'].sort(),
  'AL': ['Arapiraca', 'Coruripe', 'Delmiro Gouveia', 'Maceió', 'Marechal Deodoro', 'Palmeira dos Índios', 'Penedo', 'Rio Largo', 'Santana do Ipanema', 'São Miguel dos Campos', 'União dos Palmares'].sort(),
  'AP': ['Laranjal do Jari', 'Macapá', 'Mazagão', 'Oiapoque', 'Porto Grande', 'Santana', 'Tartarugalzinho', 'Vitória do Jari'].sort(),
  'AM': ['Coari', 'Humaitá', 'Iranduba', 'Itacoatiara', 'Manacapuru', 'Manaus', 'Maués', 'Parintins', 'São Gabriel da Cachoeira', 'Tabatinga', 'Tefé'].sort(),
  'BA': ['Alagoinhas', 'Barreiras', 'Brumado', 'Camaçari', 'Candeias', 'Casa Nova', 'Dias d\'Ávila', 'Eunápolis', 'Feira de Santana', 'Guanambi', 'Ilhéus', 'Irecê', 'Itabuna', 'Itapetinga', 'Jacobina', 'Jequié', 'Juazeiro', 'Lauro de Freitas', 'Luís Eduardo Magalhães', 'Paulo Afonso', 'Porto Seguro', 'Salvador', 'Santo Antônio de Jesus', 'Senhor do Bonfim', 'Simões Filho', 'Teixeira de Freitas', 'Valença', 'Vitória da Conquista'].sort(),
  'CE': ['Aracati', 'Aquiraz', 'Canindé', 'Caucaia', 'Crateús', 'Crato', 'Fortaleza', 'Iguatu', 'Itapipoca', 'Juazeiro do Norte', 'Maracanaú', 'Maranguape', 'Pacajus', 'Quixadá', 'Quixeramobim', 'Sobral'].sort(),
  'DF': ['Águas Claras', 'Brasília', 'Ceilândia', 'Gama', 'Planaltina', 'Recanto das Emas', 'Samambaia', 'Santa Maria', 'Sobradinho', 'Taguatinga', 'Vicente Pires'].sort(),
  'ES': ['Aracruz', 'Barra de São Francisco', 'Cachoeiro de Itapemirim', 'Cariacica', 'Castelo', 'Colatina', 'Guarapari', 'Linhares', 'Nova Venécia', 'Santa Maria de Jetibá', 'São Mateus', 'Serra', 'Viana', 'Vila Velha', 'Vitória'].sort(),
  'GO': ['Águas Lindas de Goiás', 'Anápolis', 'Aparecida de Goiânia', 'Caldas Novas', 'Catalão', 'Cidade Ocidental', 'Cristalina', 'Formosa', 'Goianésia', 'Goiânia', 'Inhumas', 'Itumbiara', 'Jataí', 'Luziânia', 'Mineiros', 'Novo Gama', 'Planaltina', 'Rio Verde', 'Santo Antônio do Descoberto', 'Senador Canedo', 'Trindade', 'Valparaíso de Goiás'].sort(),
  'MA': ['Açailândia', 'Bacabal', 'Balsas', 'Barra do Corda', 'Caxias', 'Chapadinha', 'Codó', 'Imperatriz', 'Paço do Lumiar', 'Pedreiras', 'Pinheiro', 'Presidente Dutra', 'Santa Inês', 'São José de Ribamar', 'São Luís', 'São Mateus do Maranhão', 'Timon'].sort(),
  'MT': ['Alta Floresta', 'Barra do Garças', 'Cáceres', 'Colíder', 'Cuiabá', 'Guarantã do Norte', 'Juína', 'Lucas do Rio Verde', 'Nova Mutum', 'Pontes e Lacerda', 'Primavera do Leste', 'Rondonópolis', 'Sinop', 'Sorriso', 'Tangará da Serra', 'Várzea Grande'].sort(),
  'MS': ['Amambai', 'Anastácio', 'Aquidauana', 'Campo Grande', 'Corumbá', 'Coxim', 'Dourados', 'Jardim', 'Maracaju', 'Naviraí', 'Nova Andradina', 'Paranaíba', 'Ponta Porã', 'São Gabriel do Oeste', 'Sidrolândia', 'Três Lagoas'].sort(),
  'MG': ['Araguari', 'Araraquara', 'Araxá', 'Barbacena', 'Belo Horizonte', 'Betim', 'Conselheiro Lafaiete', 'Contagem', 'Coronel Fabriciano', 'Divinópolis', 'Formiga', 'Governador Valadares', 'Ibirité', 'Ipatinga', 'Itabira', 'Itajubá', 'Ituiutaba', 'Juiz de Fora', 'Lavras', 'Manhuaçu', 'Montes Claros', 'Muriaé', 'Nova Lima', 'Passos', 'Patrocínio', 'Patos de Minas', 'Poços de Caldas', 'Pouso Alegre', 'Ribeirão das Neves', 'Sabará', 'Santa Luzia', 'Sete Lagoas', 'Teófilo Otoni', 'Uberaba', 'Uberlândia', 'Varginha', 'Viçosa'].sort(),
  'PA': ['Abaetetuba', 'Altamira', 'Ananindeua', 'Barcarena', 'Belém', 'Benevides', 'Bragança', 'Breves', 'Cametá', 'Capanema', 'Castanhal', 'Itaituba', 'Marabá', 'Maracanã', 'Marituba', 'Mocajuba', 'Oriximiná', 'Paragominas', 'Parauapebas', 'Redenção', 'Salinópolis', 'Santarém', 'São Félix do Xingu', 'Tailândia', 'Tomé-Açu', 'Tucuruí'].sort(),
  'PB': ['Bayeux', 'Cabedelo', 'Cajazeiras', 'Campina Grande', 'Esperança', 'Guarabira', 'Itabaiana', 'João Pessoa', 'Mamanguape', 'Monteiro', 'Patos', 'Pombal', 'Princesa Isabel', 'Queimadas', 'Rio Tinto', 'Santa Rita', 'Sapé', 'Sousa'].sort(),
  'PR': ['Almirante Tamandaré', 'Apucarana', 'Araucária', 'Cambé', 'Campo Largo', 'Cascavel', 'Cianorte', 'Colombo', 'Curitiba', 'Fazenda Rio Grande', 'Foz do Iguaçu', 'Francisco Beltrão', 'Guarapuava', 'Londrina', 'Maringá', 'Paranaguá', 'Paranavaí', 'Pato Branco', 'Pinhais', 'Piraquara', 'Ponta Grossa', 'Sarandi', 'São José dos Pinhais', 'Telêmaco Borba', 'Toledo', 'Umuarama'].sort(),
  'PE': ['Abreu e Lima', 'Araripina', 'Arcoverde', 'Belo Jardim', 'Cabo de Santo Agostinho', 'Camaragibe', 'Caruaru', 'Escada', 'Garanhuns', 'Goiana', 'Igarassu', 'Jaboatão dos Guararapes', 'Olinda', 'Ouricuri', 'Palmares', 'Paulista', 'Petrolina', 'Recife', 'Santa Cruz do Capibaribe', 'São Lourenço da Mata', 'Serra Talhada', 'Vitória de Santo Antão'].sort(),
  'PI': ['Altos', 'Barras', 'Bom Jesus', 'Campo Maior', 'Canto do Buriti', 'Esperantina', 'Floriano', 'Oeiras', 'Parnaíba', 'Pedro II', 'Picos', 'Pinheiro', 'Piripiri', 'São Raimundo Nonato', 'Teresina', 'União', 'Valença do Piauí'].sort(),
  'RJ': ['Angra dos Reis', 'Araruama', 'Barra do Piraí', 'Barra Mansa', 'Belford Roxo', 'Cabo Frio', 'Campos dos Goytacazes', 'Duque de Caxias', 'Itaboraí', 'Itaguaí', 'Japeri', 'Macaé', 'Magé', 'Maricá', 'Mesquita', 'Nilópolis', 'Niterói', 'Nova Friburgo', 'Nova Iguaçu', 'Petrópolis', 'Queimados', 'Resende', 'Rio das Ostras', 'Rio de Janeiro', 'Saquarema', 'São Gonçalo', 'São João de Meriti', 'Teresópolis', 'Três Rios', 'Volta Redonda'].sort(),
  'RN': ['Apodi', 'Assu', 'Caicó', 'Ceará-Mirim', 'Currais Novos', 'Extremoz', 'João Câmara', 'Macaíba', 'Mossoró', 'Natal', 'Nova Cruz', 'Parnamirim', 'Pau dos Ferros', 'Santa Cruz', 'São Gonçalo do Amarante', 'São José de Mipibu'].sort(),
  'RS': ['Alegrete', 'Alvorada', 'Bagé', 'Bento Gonçalves', 'Cachoeira do Sul', 'Cachoeirinha', 'Camaquã', 'Canoas', 'Caxias do Sul', 'Erechim', 'Gravataí', 'Guaíba', 'Ijuí', 'Lajeado', 'Novo Hamburgo', 'Passo Fundo', 'Pelotas', 'Porto Alegre', 'Rio Grande', 'Santa Cruz do Sul', 'Santa Maria', 'Santana do Livramento', 'Santo Ângelo', 'São Leopoldo', 'Sapiranga', 'Sapucaia do Sul', 'Uruguaiana', 'Vacaria', 'Viamão'].sort(),
  'RO': ['Ariquemes', 'Buritis', 'Cacoal', 'Cerejeiras', 'Colorado do Oeste', 'Espigão d\'Oeste', 'Guajará-Mirim', 'Jaru', 'Ji-Paraná', 'Ouro Preto do Oeste', 'Pimenta Bueno', 'Porto Velho', 'Rolim de Moura', 'Vilhena'].sort(),
  'RR': ['Alto Alegre', 'Boa Vista', 'Bonfim', 'Cantá', 'Caracaraí', 'Mucajaí', 'Normandia', 'Pacaraima', 'Rorainópolis', 'São João da Baliza', 'São Luiz'].sort(),
  'SC': ['Araranguá', 'Balneário Camboriú', 'Biguaçu', 'Blumenau', 'Brusque', 'Caçador', 'Camboriú', 'Canoinhas', 'Chapecó', 'Concórdia', 'Criciúma', 'Florianópolis', 'Gaspar', 'Içara', 'Indaial', 'Itajaí', 'Itapema', 'Jaraguá do Sul', 'Joinville', 'Lages', 'Mafra', 'Navegantes', 'Palhoça', 'Rio do Sul', 'São Bento do Sul', 'São José', 'Tubarão', 'Videira'].sort(),
  'SP': ['Americana', 'Araçatuba', 'Araraquara', 'Araras', 'Atibaia', 'Barretos', 'Barueri', 'Bauru', 'Botucatu', 'Bragança Paulista', 'Campinas', 'Carapicuíba', 'Cotia', 'Diadema', 'Embu das Artes', 'Ferraz de Vasconcelos', 'Franca', 'Francisco Morato', 'Guaratinguetá', 'Guarujá', 'Guarulhos', 'Hortolândia', 'Indaiatuba', 'Itapecericada Serra', 'Itapetininga', 'Itapevi', 'Itaquaquecetuba', 'Itu', 'Jacareí', 'Jandira', 'Jundiaí', 'Limeira', 'Marília', 'Mauá', 'Mogi das Cruzes', 'Osasco', 'Pindamonhangaba', 'Piracicaba', 'Praia Grande', 'Presidente Prudente', 'Ribeirão Pires', 'Ribeirão Preto', 'Santana de Parnaíba', 'Santo André', 'Santos', 'São Bernardo do Campo', 'São Carlos', 'São José do Rio Preto', 'São José dos Campos', 'São Paulo', 'São Vicente', 'Sertãozinho', 'Sorocaba', 'Sumaré', 'Suzano', 'Taboão da Serra', 'Taubaté', 'Várzea Paulista', 'Votorantim'].sort(),
  'SE': ['Aquidabã', 'Aracaju', 'Barra dos Coqueiros', 'Capela', 'Estância', 'Itabaiana', 'Lagarto', 'Laranjeiras', 'Nossa Senhora da Glória', 'Nossa Senhora do Socorro', 'Propriá', 'Simão Dias', 'São Cristóvão', 'Tobias Barreto', 'Umbaúba'].sort(),
  'TO': ['Araguaína', 'Araguatins', 'Arraias', 'Augustinópolis', 'Colinas do Tocantins', 'Dianópolis', 'Formoso do Araguaia', 'Guaraí', 'Gurupi', 'Miracema do Tocantins', 'Palmas', 'Paraíso do Tocantins', 'Pedro Afonso', 'Porto Nacional', 'Tocantinópolis'].sort()
}

export default function DadosEmpresaPage() {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome_empresa: '',
    tipo_empresa: 'Barbearia',
    telefone: '',
    facebook: '',
    instagram: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    latitude: '',
    longitude: '',
    descricao: '',
    intervalo_grade: 15,
    formato_hora: '24H',
    logo_url: ''
  })

  const [modalFormData, setModalFormData] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fim: '18:00',
    horario_almoco_inicio: '12:00',
    horario_almoco_fim: '13:00',
    ativo: true
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase!.auth.getUser()
      if (!authUser) {
        router.push('/login')
      } else {
        if (requireAdminRole(router)) {
          setLoading(false)
          return
        }
        setUser(authUser)
        loadCompanyData(authUser.id)
        loadHorarios(authUser.id)
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const loadCompanyData = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('company_data')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setCompany(data)
        setFormData(data)
      }
    } catch (error) {
    }
  }

  const loadHorarios = async (userId: string) => {
    try {
      setLoadingHorarios(true)
      const { data } = await supabase
        .from('horarios')
        .select('*')
        .eq('user_id', userId)
        .order('dia_semana', { ascending: true })

      if (data) {
        setHorarios(data as Horario[])
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    } finally {
      setLoadingHorarios(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (company?.id) {
        // Atualizar
        const { error } = await supabase
          .from('company_data')
          .update(formData)
          .eq('id', company.id)

        if (error) throw error
      } else {
        // Criar
        const { error } = await supabase
          .from('company_data')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
      }

      setToast({ message: 'Dados da empresa salvos com sucesso!', type: 'success' })
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao salvar', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveHorario = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingHorario?.id) {
        // Atualizar
        const { error } = await supabase
          .from('horarios')
          .update(modalFormData)
          .eq('id', editingHorario.id)

        if (error) throw error
        setToast({ message: 'Horário atualizado com sucesso!', type: 'success' })
      } else {
        // Criar
        const { error } = await supabase
          .from('horarios')
          .insert([{ ...modalFormData, user_id: user.id }])

        if (error) throw error
        setToast({ message: 'Horário criado com sucesso!', type: 'success' })
      }

      setShowModal(false)
      setEditingHorario(null)
      setModalFormData({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '18:00',
        horario_almoco_inicio: '12:00',
        horario_almoco_fim: '13:00',
        ativo: true
      })
      loadHorarios(user.id)
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao salvar horário', type: 'error' })
    }
  }

  const handleDeleteHorario = async (horarioId: string) => {
    if (!confirm('Tem certeza que deseja deletar este horário?')) return

    try {
      const { error } = await supabase
        .from('horarios')
        .delete()
        .eq('id', horarioId)

      if (error) throw error
      setToast({ message: 'Horário deletado com sucesso!', type: 'success' })
      loadHorarios(user.id)
    } catch (error: any) {
      setToast({ message: error.message || 'Erro ao deletar', type: 'error' })
    }
  }

  const openEditModal = (horario: Horario) => {
    setEditingHorario(horario)
    setModalFormData({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fim: horario.hora_fim,
      horario_almoco_inicio: horario.horario_almoco_inicio || '12:00',
      horario_almoco_fim: horario.horario_almoco_fim || '13:00',
      ativo: horario.ativo
    })
    setShowModal(true)
  }

  const openNewModal = () => {
    setEditingHorario(null)
    setModalFormData({
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fim: '18:00',
      horario_almoco_inicio: '12:00',
      horario_almoco_fim: '13:00',
      ativo: true
    })
    setShowModal(true)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar user={user} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Sidebar user={user} />
      
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ maxWidth: '800px' }}>
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Dados da Empresa</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Informações da sua empresa ou consultório
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {/* Título do formulário */}
            <h3 style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '14px' }}>
              Editando {formData.nome_empresa || 'sua empresa'}
            </h3>

            {/* Upload de Logo */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  // Validar tamanho (máximo 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    setToast({ message: 'Arquivo muito grande. Máximo 5MB.', type: 'error' })
                    return
                  }

                  try {
                    setSubmitting(true)
                    
                    // Gerar nome único para o arquivo
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${user.id}_${Date.now()}.${fileExt}`
                    
                    // Upload para Supabase Storage
                    const { data: uploadData, error: uploadError } = await supabase!.storage
                      .from('company-logos')
                      .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                      })

                    if (uploadError) throw uploadError

                    // Deletar logo antiga se existir
                    if (formData.logo_url && formData.logo_url.includes('company-logos')) {
                      const oldPath = formData.logo_url.split('company-logos/')[1]?.split('?')[0]
                      if (oldPath) {
                        await supabase!.storage.from('company-logos').remove([oldPath])
                      }
                    }

                    // Obter URL pública
                    const { data: urlData } = supabase!.storage
                      .from('company-logos')
                      .getPublicUrl(fileName)

                    setFormData({ ...formData, logo_url: urlData.publicUrl })
                    setToast({ message: 'Logo enviada com sucesso!', type: 'success' })
                  } catch (error: any) {
                    console.error('Erro ao fazer upload:', error)
                    setToast({ message: error.message || 'Erro ao enviar logo', type: 'error' })
                  } finally {
                    setSubmitting(false)
                  }
                }}
                style={{ display: 'none' }}
              />
              <label
                htmlFor="logoUpload"
                style={{
                  width: '200px',
                  height: '150px',
                  margin: '0 auto',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {formData.logo_url ? (
                  <>
                    <img src={formData.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '6px' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '5px',
                      fontSize: '12px',
                      opacity: '0',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      Clique para trocar
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Clique para selecionar a logo</span>
                  </div>
                )}
              </label>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Nome Empresa */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Nome da empresa
                </label>
                <input
                  type="text"
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Tipo Empresa */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Tipo Empresa
                </label>
                <select
                  value={formData.tipo_empresa}
                  onChange={(e) => setFormData({ ...formData, tipo_empresa: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Barbearia">Barbearia</option>
                  <option value="Salão de Beleza">Salão de Beleza</option>
                  <option value="Outra Área">Outra Área</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                Descrição
              </label>
              <textarea
                placeholder="Descreva sua empresa..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Informações de contato */}
            <h4 style={{ margin: '30px 0 15px 0', color: '#9ca3af', fontSize: '14px' }}>
              Informações de contato
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Telefone */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(00) 0000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Facebook */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Facebook
                </label>
                <input
                  type="text"
                  placeholder="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Instagram */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Instagram
                </label>
                <input
                  type="text"
                  placeholder="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Agendamento */}
            <h4 style={{ margin: '30px 0 15px 0', color: '#9ca3af', fontSize: '14px' }}>
              Agendamento
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {/* Intervalo grade de horários */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Intervalo grade de horários
                </label>
                <select
                  value={formData.intervalo_grade}
                  onChange={(e) => setFormData({ ...formData, intervalo_grade: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              {/* Formato da hora */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Formato da hora
                </label>
                <select
                  value={formData.formato_hora}
                  onChange={(e) => setFormData({ ...formData, formato_hora: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="24H">24H</option>
                  <option value="12H">12H</option>
                </select>
              </div>
            </div>

            {/* Endereço */}
            <h4 style={{ margin: '30px 0 15px 0', color: '#9ca3af', fontSize: '14px' }}>
              Endereço
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* CEP */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  CEP
                </label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Rua */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Rua
                </label>
                <input
                  type="text"
                  placeholder="Rua josé carmindo"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Número */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Número
                </label>
                <input
                  type="text"
                  placeholder="100 W"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Bairro */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Bairro
                </label>
                <input
                  type="text"
                  placeholder="Centro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Complemento */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Complemento
                </label>
                <input
                  type="text"
                  placeholder="Sala 20"
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Estado */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => {
                    setFormData({ ...formData, estado: e.target.value, cidade: '' })
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Cidade
                </label>
                <select
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  disabled={!formData.estado}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: !formData.estado ? '#f3f4f6' : 'white',
                    cursor: !formData.estado ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">
                    {formData.estado ? 'Selecione a cidade...' : 'Selecione o estado primeiro'}
                  </option>
                  {formData.estado && CIDADES_POR_ESTADO[formData.estado]?.map((cidade) => (
                    <option key={cidade} value={cidade}>
                      {cidade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Latitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Latitude
                </label>
                <input
                  type="text"
                  placeholder="-8.33692936341994"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Longitude */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                  Longitude
                </label>
                <input
                  type="text"
                  placeholder="-36.4709019483294"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Botão de Geolocalização */}
            <div style={{ marginBottom: '30px' }}>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                      setFormData({
                        ...formData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString()
                      })
                      setToast({ message: 'Localização obtida com sucesso!', type: 'success' })
                    })
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2C5F6F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                📍 Pegar minha posição atual
              </button>
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#2C5F6F',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Salvando...' : '✓ Salvar'}
            </button>
          </form>

          {/* Seção de Horários */}
          <div style={{ marginTop: '40px' }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '14px' }}>
              Horários
            </h4>

            {loadingHorarios ? (
              <LoadingSpinner />
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative'
              }}>
                {/* Botão Novo Horário */}
                <div style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                  <button
                    onClick={openNewModal}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#2C5F6F',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    Novo horário
                  </button>
                </div>

                {horarios.length === 0 ? (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <p style={{ margin: '0' }}>Nenhum horário cadastrado ainda</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#2C5F6F', color: 'white' }}>
                        <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                          DIA DA SEMANA
                        </th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
                          EXPEDIENTE
                        </th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
                          ALMOÇO
                        </th>
                        <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', fontSize: '13px', width: '80px' }}>
                          
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {horarios.map((horario, idx) => (
                        <tr 
                          key={horario.id} 
                          style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                          }}
                        >
                          <td style={{ padding: '15px', color: '#1f2937', fontSize: '14px' }}>
                            {DIAS_SEMANA[horario.dia_semana] || 'N/A'}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#1f2937', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              <input type="time" value={horario.hora_inicio} readOnly style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                              <span>à</span>
                              <input type="time" value={horario.hora_fim} readOnly style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                              <button style={{ background: 'none', border: 'none', color: '#2C5F6F', cursor: 'pointer', fontSize: '18px' }}>
                                ⏱️
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#1f2937', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                              <input type="time" value={horario.horario_almoco_inicio || '12:00'} readOnly style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                              <span>à</span>
                              <input type="time" value={horario.horario_almoco_fim || '13:00'} readOnly style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} />
                              <button style={{ background: 'none', border: 'none', color: '#2C5F6F', cursor: 'pointer', fontSize: '18px' }}>
                                ⏱️
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteHorario(horario.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '5px 10px',
                                borderRadius: '4px'
                              }}
                              title="Deletar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Botão Salvar Fixo */}
                {horarios.length > 0 && (
                  <div style={{ padding: '15px', textAlign: 'right', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => setToast({ message: 'Horários salvos!', type: 'success' })}
                      style={{
                        padding: '10px 24px',
                        backgroundColor: '#2C5F6F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      ✓ Salvar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Novo/Editar Horário */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
              {editingHorario ? '✏️ Editar Horário' : '➕ Novo Horário'}
            </h2>

            <form onSubmit={handleSaveHorario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Dia da Semana */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Dia da Semana
                </label>
                <select
                  value={modalFormData.dia_semana}
                  onChange={(e) => setModalFormData({ ...modalFormData, dia_semana: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  {DIAS_SEMANA.map((dia, idx) => (
                    <option key={idx} value={idx}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horário de Início */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={modalFormData.hora_inicio}
                  onChange={(e) => setModalFormData({ ...modalFormData, hora_inicio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Horário de Fim */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
                  Horário de Fim
                </label>
                <input
                  type="time"
                  value={modalFormData.hora_fim}
                  onChange={(e) => setModalFormData({ ...modalFormData, hora_fim: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Almoço - Início */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '13px' }}>
                    Almoço - Início
                  </label>
                  <input
                    type="time"
                    value={modalFormData.horario_almoco_inicio}
                    onChange={(e) => setModalFormData({ ...modalFormData, horario_almoco_inicio: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Almoço - Fim */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '13px' }}>
                    Almoço - Fim
                  </label>
                  <input
                    type="time"
                    value={modalFormData.horario_almoco_fim}
                    onChange={(e) => setModalFormData({ ...modalFormData, horario_almoco_fim: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Checkbox Ativo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={modalFormData.ativo}
                  onChange={(e) => setModalFormData({ ...modalFormData, ativo: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label style={{ cursor: 'pointer', fontWeight: '500', color: '#374151' }}>
                  Horário Ativo
                </label>
              </div>

              {/* Botões */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingHorario(null)
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px',
                    backgroundColor: '#2C5F6F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {editingHorario ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
